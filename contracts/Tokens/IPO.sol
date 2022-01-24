// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.12;

import '../Libraries/SafeMath.sol';
import './IBEP20.sol';
import '../Libraries/SafeBEP20.sol';
import '../Modifiers/ReentrancyGuard.sol';
import '../Modifiers/Ownable.sol';
import "../Modifiers/WhitelistUpgradeable.sol";
import "../Modifiers/BlacklistUpgradeable.sol";

/**
 * @dev PantherSwap: Initial Panther Offering
 *
 * Website: https://pantherswap.com
 * Dex: https://dex.pantherswap.com
 * Twitter: https://twitter.com/PantherSwap
 *
 */
contract IPO is ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    // Info of each user.
    struct UserInfo {
        uint256 depositedInvestmentTokens;   // How many tokens the user has provided.
        uint256 refundedInvestmentTokens;   // How many tokens the user has been refunded.

        uint256 claimableProjectTokens;

        uint256 depositedWGLBD;
        uint256 remainingWGLBD;
        bool migrateGLB;  // default false
        bool depositWGLBD;  // default false
        bool whitelisted;  // default false
    }

    // The raising token
    address public wGLBD;
    // The raising token
    address public investmentToken;
    // The offering token
    address public projectToken;
    // The block number when IPO starts
    uint256 public startPresale;
    // The block number when IPO ends
    uint256 public endPresale;
    // The block number when IPO ends
    uint256 public startClaim;
    // total amount of wGLBD needed to be deposited
    uint256 public requiredWGLBD;
    // max amount of investment tokens that can invest any user
    uint256 public maxInvestment;
    // total amount of investment tokens need to be raised
    uint256 public raisingAmount;
    // total amount of investment tokens that have already raised
    uint256 public totalAmountInvested;
    // address => amount
    mapping (address => UserInfo) public userInfo;
    // participators
    address[] public addressList;
    mapping (address => bool) private whitelist;
    mapping (address => bool) private blacklist;

      event Invest(address indexed user, uint256 amount);
      event Claim(address indexed user, uint256 amount);

  constructor(
      address _wGLBD,
      address _investmentToken,
      address _projectToken,
      uint256 _startPresale,
      uint256 _endPresale,
      uint256 _startClaim,
      //uint256 _offeringAmount,
      uint256 _maxInvestment,
      uint256 _requiredWGLBD,
      uint256 _raisingAmount
  ) public {
      wGLBD = _wGLBD;
      investmentToken = _investmentToken;
      projectToken = _projectToken;
      startPresale = _startPresale;
      endPresale = _endPresale;
      startClaim = _startClaim;
      //offeringAmount = _offeringAmount;
      maxInvestment = _maxInvestment;
      requiredWGLBD = _requiredWGLBD;
      raisingAmount= _raisingAmount;
      totalAmountInvested = 0;
  }

    function isWhitelist(address _address) public view returns(bool) {
        return whitelist[_address];
    }

    function setWhitelist(address _address, bool _on) external onlyOwner {
        whitelist[_address] = _on;
    }

    function isBlacklist(address _address) public view returns(bool) {
        return blacklist[_address];
    }

    function setBlacklist(address _address, bool _on) external onlyOwner {
        blacklist[_address] = _on;
    }

  //function setOfferingAmount(uint256 _offerAmount) public onlyOwner {
  //  require (block.number < startBlock, 'no');
  //  offeringAmount = _offerAmount;
  //}

    function setRequiredWGLBD(uint256 _requiredWGLBD) public onlyOwner {
        requiredWGLBD= _requiredWGLBD;
    }

    function setRaisingAmount(uint256 _raisingAmount) public onlyOwner {
        raisingAmount= _raisingAmount;
    }

    function canInvest(address _user) public view returns (bool)
    {
        return true;
    }

    function invest(uint256 _amount) public
    {
        require (block.number > startPresale && block.timestamp < endPresale, 'not presale time');
        require (canInvest(msg.sender), 'you cannot invest'); // TODO comprovar si es tenen prous wGLBDs
        require (_amount > 0, 'need _amount > 0');
        require (userInfo[msg.sender].depositedInvestmentTokens.add(_amount) > maxInvestment, 'you cannot invest more');

        if(!canInvest(msg.sender))
        {
            //wGLBD.safeTransferFrom(address(msg.sender), address(this), requiredWGLBD); TODO
            userInfo[msg.sender].depositedWGLBD = requiredWGLBD;
            userInfo[msg.sender].remainingWGLBD = requiredWGLBD;
        }

        IBEP20(investmentToken).safeTransferFrom(address(msg.sender), address(this), _amount);
        if (userInfo[msg.sender].depositedInvestmentTokens == 0) {
          addressList.push(address(msg.sender));
        }
        userInfo[msg.sender].depositedInvestmentTokens = userInfo[msg.sender].depositedInvestmentTokens.add(_amount);
        totalAmountInvested = totalAmountInvested.add(_amount);

        emit Invest(msg.sender, _amount);
    }

    // get the amount of investment tokens you will be refunded
    function getExcessInvestmentTokens(address _user) public view returns(uint256) {
        if (totalAmountInvested <= raisingAmount) {
            return 0;
        }
        uint256 allocation = getUserAllocation(_user);
        uint256 payAmount = raisingAmount.mul(allocation).div(1e6);
        return userInfo[_user].depositedInvestmentTokens.sub(payAmount).sub(userInfo[_user].refundedInvestmentTokens);
    }

    function refundExcessInvestmentTokens(address _user) public nonReentrant {
        uint256 refundingTokenAmount = getExcessInvestmentTokens(_user);
        if (refundingTokenAmount > 0) {
            IBEP20(investmentToken).safeTransfer(_user, refundingTokenAmount);
            userInfo[_user].refundedInvestmentTokens = userInfo[_user].refundedInvestmentTokens.add(refundingTokenAmount);
        }
    }

    function recoverWGLBD(address _depositor) external returns ( uint ) {
        uint transferAmount = availableToRecoverWGLBD(_depositor);

        //wGLBD.safetransferfrom(address(this),_depositor, transferAmount); TODO

        userInfo[_depositor].remainingWGLBD = userInfo[_depositor].remainingWGLBD.sub(transferAmount);

        return transferAmount;
    }

    function availableToInvest(address _depositor) public view returns ( uint ) {
        return maxInvestment.sub(userInfo[ _depositor ].depositedInvestmentTokens);
    }

    function availableToRecoverWGLBD(address _depositor) public view returns ( uint ) {
        UserInfo memory user = userInfo[ _depositor ];

        uint harvestingAmount = 0;
        if(endPresale>block.timestamp)
        {
            harvestingAmount = user.remainingWGLBD;
        }
        else if(startClaim>block.timestamp)
        {
            harvestingAmount = user.depositedWGLBD.mul(startClaim.sub(block.timestamp)).div(startClaim.sub(endPresale));
        }

        return user.remainingWGLBD.sub(harvestingAmount);
    }

  // allocation 100000 means 0.1(10%), 1 meanss 0.000001(0.0001%), 1000000 means 1(100%)
  function getUserAllocation(address _user) public view returns(uint256) {
    return userInfo[_user].depositedInvestmentTokens.mul(1e12).div(totalAmountInvested).div(1e6);
  }

  // get the amount of IPO token you will get
  function getOfferingAmount(address _user, uint _amount) public view returns(uint256) {
      uint256 allocation = getUserAllocation(_user);
      return _amount.mul(allocation).div(1e6);
  }

    function distributeProjectTokens(uint _amount, uint256 start, uint256 end) public onlyOwner {

        for (uint256 i = 0; i < addressList.length; i++)
        {
            userInfo[addressList[i]].claimableProjectTokens = getOfferingAmount(addressList[i],_amount);
        }
    }

    function distributeProjectTokens(uint _amount) public onlyOwner {
        distributeProjectTokens(_amount,0,addressList.length);
    }

    function claimProjectTokens(address _user) public nonReentrant {
        uint256 claimAmount = userInfo[_user].claimableProjectTokens;

        if (claimAmount > 0) {
            //projectToken.safeTransfer(_user, claimAmount); TODO
            userInfo[_user].claimableProjectTokens = 0;
            emit Claim(msg.sender, claimAmount);
        }
    }

  function getAddressListLength() external view returns(uint256) {
    return addressList.length;
  }

    function withdrawInvestmentToken(uint256 _amount) public onlyOwner {
        uint256 amountBlocked = totalAmountInvested > raisingAmount ? totalAmountInvested - raisingAmount : 0;
        require (_amount <= IBEP20(investmentToken).balanceOf(address(this)).sub(amountBlocked), 'not enough investment tokens');
        IBEP20(investmentToken).safeTransfer(address(msg.sender), _amount);
    }

    function withdrawInvestmentToken() public onlyOwner {
        uint256 amountBlocked = totalAmountInvested > raisingAmount ? totalAmountInvested - raisingAmount : 0;
        IBEP20(investmentToken).safeTransfer(address(msg.sender), IBEP20(investmentToken).balanceOf(address(this)).sub(amountBlocked));
    }

    function withdrawProjectToken(uint256 _amount) public onlyOwner {
        //require (_amount <= projectToken.balanceOf(address(this)), 'not enough project token'); TODO
        //projectToken.safeTransfer(address(msg.sender), _amount); TODO
    }

    function withdrawProjectToken() public onlyOwner {
        //projectToken.safeTransfer(address(msg.sender), projectToken.balanceOf(address(this))); TODO
    }
}