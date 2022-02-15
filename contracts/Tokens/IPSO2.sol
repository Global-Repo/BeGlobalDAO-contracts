// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import './IBEP20.sol';
import './IERC20.sol';
import '../Libraries/SafeBEP20.sol';
import '../Libraries/SafeERC20.sol';
import '../Libraries/SafeMath.sol';
import '../Modifiers/ReentrancyGuard.sol';
import '../Modifiers/Ownable.sol';

/**
 * @dev BeGlobalDAO: Initial Private Sale Offering
 */
contract IPSO2 is ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;
    using SafeERC20 for IERC20;

    uint public constant DUST = 1000;

    // Info of each user.
    struct UserInfo {
        uint256 depositedInvestmentTokens;   // How many tokens the user has provided.
        uint256 refundedInvestmentTokens;   // How many tokens the user has been refunded.

        uint256 claimableProjectTokens;

        uint256 depositedWGLBD;
        uint256 remainingWGLBD;
        bool depositWGLBD;  // default false
        bool whitelisted;  // default false
    }

    // The raising token
    address public wGLBD;
    // The raising token
    address public investmentToken;
    // The offering token
    address public projectToken;
    // The block number when IPSO starts
    uint256 public startPresale;
    // The block number when IPSO ends
    uint256 public endPresale;
    // The block number when IPSO ends
    uint256 public startClaim;
    // ratio of wGLBD needed to be deposited / BUSD invested
    uint256 public ratioRequiredWGLBD;
    // amount of wglbd equivalent to being whitelisted
    uint256 public amountForWhitelisted;
    // min amount of investment tokens that can invest any user
    uint256 public minInvestment;
    // max amount of investment tokens that can invest any user
    uint256 public maxInvestment;
    // total amount of investment tokens need to be raised
    uint256 public raisingAmount;
    // total amount of investment tokens that have already raised
    uint256 public totalAmountInvested;
    // total amount of investment tokens remaining
    uint256 public totalAmountInvestedRemaining;
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
      uint256 _startPresale,
      uint256 _endPresale,
      uint256 _startClaim,
      uint256 _ratioRequiredWGLBD,
      uint256 _amountForWhitelisted,
      uint256 _minInvestment,
      uint256 _maxInvestment,
      uint256 _raisingAmount
  ) {
      wGLBD = _wGLBD;
      investmentToken = _investmentToken;
      startPresale = _startPresale;
      endPresale = _endPresale;
      startClaim = _startClaim;
      ratioRequiredWGLBD = _ratioRequiredWGLBD;
      amountForWhitelisted = _amountForWhitelisted;
      minInvestment = _minInvestment;
      maxInvestment = _maxInvestment;
      raisingAmount= _raisingAmount;
      totalAmountInvested = 0;
      totalAmountInvestedRemaining = 0;
  }

    function setProjectToken(address _projectToken) external onlyOwner {
        projectToken = _projectToken;
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

    function setStartPresale(uint256 _startPresale) public onlyOwner {
        startPresale = _startPresale;
    }

    function setEndPresale(uint256 _endPresale) public onlyOwner {
        endPresale = _endPresale;
    }

    function setStartClaim(uint256 _startClaim) public onlyOwner {
        startClaim = _startClaim;
    }

    function setRatioRequiredWGLBD(uint256 _ratioRequiredWGLBD) public onlyOwner {
        ratioRequiredWGLBD = _ratioRequiredWGLBD;
    }

    function setAmountForWhitelisted(uint256 _amountForWhitelisted) public onlyOwner {
        amountForWhitelisted = _amountForWhitelisted;
    }

    function setMinInvestment(uint256 _minInvestment) public onlyOwner {
        minInvestment = _minInvestment;
    }

    function setMaxInvestment(uint256 _maxInvestment) public onlyOwner {
        maxInvestment = _maxInvestment;
    }

    function setRaisingAmount(uint256 _raisingAmount) public onlyOwner {
        raisingAmount = _raisingAmount;
    }

    function canInvest(address _user) public view returns (bool)
    {
        return isWhitelist(_user);
    }

    function canInvestAmount(address _user) public view returns (uint)
    {
        uint amountToInvest = isWhitelist(_user) && !userInfo[msg.sender].whitelisted ? ((IERC20(wGLBD).balanceOf(msg.sender)).mul(ratioRequiredWGLBD)).add(amountForWhitelisted) : (IERC20(wGLBD).balanceOf(msg.sender)).mul(ratioRequiredWGLBD);
        return amountToInvest > maxInvestment.sub(userInfo[msg.sender].depositedInvestmentTokens) ? maxInvestment.sub(userInfo[msg.sender].depositedInvestmentTokens) : amountToInvest;
    }

    function invest(uint256 _amount) public
    {
        require (userInfo[msg.sender].depositedInvestmentTokens > 0 || minInvestment<=_amount, 'you need to invest more');
        require (block.timestamp > startPresale && block.timestamp < endPresale, 'not presale time');
        require (_amount > 0, 'need _amount > 0');
        require (_amount <= canInvestAmount(msg.sender), 'you cannot invest so many tokens'); //
        require (!isBlacklist(msg.sender), 'YOU cannot invest'); //

        uint256 wglbdToDeposit = _amount.div(ratioRequiredWGLBD);

        if(userInfo[msg.sender].whitelisted && userInfo[msg.sender].depositedInvestmentTokens < amountForWhitelisted)
        {
            userInfo[msg.sender].whitelisted = true;
            uint256 wglbdForWhitelisted = amountForWhitelisted.sub(userInfo[msg.sender].depositedInvestmentTokens).div(ratioRequiredWGLBD);
            wglbdToDeposit = wglbdToDeposit < wglbdForWhitelisted ? 0 : wglbdToDeposit.sub(wglbdForWhitelisted);
        }

        if(wglbdToDeposit>0)
        {
            userInfo[msg.sender].depositWGLBD = true;
            userInfo[msg.sender].depositedWGLBD = userInfo[msg.sender].depositedWGLBD.add(wglbdToDeposit);
            userInfo[msg.sender].remainingWGLBD = userInfo[msg.sender].remainingWGLBD.add(wglbdToDeposit);
            IERC20(wGLBD).safeTransferFrom(address(msg.sender), address(this), wglbdToDeposit);
        }

        IBEP20(investmentToken).safeTransferFrom(address(msg.sender), address(this), _amount);
        if (userInfo[msg.sender].depositedInvestmentTokens == 0) {
          addressList.push(address(msg.sender));
        }
        userInfo[msg.sender].depositedInvestmentTokens = userInfo[msg.sender].depositedInvestmentTokens.add(_amount);
        totalAmountInvested = totalAmountInvested.add(_amount);
        totalAmountInvestedRemaining = totalAmountInvestedRemaining.add(_amount);

        emit Invest(msg.sender, _amount);
    }

    // get the amount of investment tokens you will be refunded
    function getExcessInvestmentTokens(address _user) public view returns(uint256) {
        if (totalAmountInvested <= raisingAmount) {
            return 0;
        }
        uint256 allocation = getUserAllocation(_user);
        uint256 payAmount = raisingAmount.mul(allocation).div(1e6);
        uint256 excessInvestment = userInfo[_user].depositedInvestmentTokens.sub(payAmount).sub(userInfo[_user].refundedInvestmentTokens);
        return excessInvestment>DUST?excessInvestment:0;
    }

    function refundExcessInvestmentTokens(address _user) public nonReentrant {
        require (block.timestamp > endPresale, 'not refund time');
        uint256 refundingTokenAmount = getExcessInvestmentTokens(_user);
        if (refundingTokenAmount > 0)
        {
            totalAmountInvestedRemaining = totalAmountInvestedRemaining.sub(refundingTokenAmount);
            IBEP20(investmentToken).safeTransfer(_user, refundingTokenAmount);
            userInfo[_user].refundedInvestmentTokens = userInfo[_user].refundedInvestmentTokens.add(refundingTokenAmount);
        }
    }

    function recoverWGLBD(address _depositor) external returns ( uint ) {
        uint transferAmount = availableToRecoverWGLBD(_depositor);

        IERC20(wGLBD).safeTransfer(_depositor, transferAmount);

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
            harvestingAmount = user.depositedWGLBD
            .mul(startClaim.sub(block.timestamp))
            .div(startClaim.sub(endPresale));
        }

        return user.remainingWGLBD.sub(harvestingAmount);
    }

  // allocation 100000 means 0.1(10%), 1 meanss 0.000001(0.0001%), 1000000 means 1(100%)
  function getUserAllocation(address _user) public view returns(uint256) {
    return userInfo[_user].depositedInvestmentTokens.mul(1e12).div(totalAmountInvested).div(1e6);
  }

  // get the amount of IPSO token you will get
  function getOfferingAmount(address _user, uint _amount) public view returns(uint256) {
      uint256 allocation = getUserAllocation(_user);
      return _amount.mul(allocation).div(1e6);
  }

    function distributeProjectTokens(uint _amount, uint256 start, uint256 end) public onlyOwner {

        for (uint256 i = start; i <= end; i++)
        {
            userInfo[addressList[i]].claimableProjectTokens = getOfferingAmount(addressList[i],_amount);
        }
    }

    function distributeProjectTokens(uint _amount) public onlyOwner {
        distributeProjectTokens(_amount,0,addressList.length-1);
    }

    function claimProjectTokens(address _user) public nonReentrant {
        uint256 claimAmount = userInfo[_user].claimableProjectTokens;

        if (claimAmount > 0) {
            IBEP20(projectToken).safeTransfer(_user, claimAmount);
            userInfo[_user].claimableProjectTokens = 0;
            emit Claim(msg.sender, claimAmount);
        }
    }

  function getAddressListLength() external view returns(uint256) {
    return addressList.length;
  }

    function withdrawInvestmentToken(uint256 _amount) public onlyOwner {
        uint256 amountBlocked = totalAmountInvestedRemaining > raisingAmount ? totalAmountInvestedRemaining.sub(raisingAmount) : 0;
        require (_amount <= IBEP20(investmentToken).balanceOf(address(this)).sub(amountBlocked), 'not enough investment tokens');

        //totalAmountInvestedRemaining = totalAmountInvestedRemaining.sub(_amount);

        IBEP20(investmentToken).safeTransfer(address(msg.sender), _amount);
    }

    function withdrawInvestmentToken() public onlyOwner {
        uint256 amountBlocked = totalAmountInvestedRemaining > raisingAmount ? totalAmountInvestedRemaining.sub(raisingAmount) : 0;

        //totalAmountInvestedRemaining = totalAmountInvestedRemaining.sub(IBEP20(investmentToken).balanceOf(address(this)).sub(amountBlocked));

        IBEP20(investmentToken).safeTransfer(address(msg.sender), IBEP20(investmentToken).balanceOf(address(this)).sub(amountBlocked));
    }

    function withdrawProjectToken(uint256 _amount) public onlyOwner {
        require (_amount <= IBEP20(projectToken).balanceOf(address(this)), 'not enough project token');
        IBEP20(projectToken).safeTransfer(address(msg.sender), _amount);
    }

    function withdrawProjectToken() public onlyOwner {
        IBEP20(projectToken).safeTransfer(address(msg.sender), IBEP20(projectToken).balanceOf(address(this)));
    }

    function recoverWrongTokens(address _tokenAddress, uint256 _tokenAmount) external onlyOwner {
        IBEP20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);
    }

    function recoverWrongTokens2(address _tokenAddress, uint256 _tokenAmount) external onlyOwner {
        IERC20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);
    }
}