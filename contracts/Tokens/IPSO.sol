// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import './IBEP20.sol';
import './IERC20.sol';
import '../Libraries/SafeBEP20.sol';
import '../Libraries/SafeMath.sol';
import '../Modifiers/ReentrancyGuard.sol';
import '../Modifiers/Ownable.sol';
import "../BondDepositoryGlb.sol";
import "../BondDepositoryGlbBusdLP.sol";
import "../BondDepositoryGlbBnbLP.sol";

/**
 * @dev BeGlobalDAO: Initial Private Sale Offering
 */
contract IPSO is ReentrancyGuard, Ownable {
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
    // The block number when IPSO starts
    uint256 public startPresale;
    // The block number when IPSO ends
    uint256 public endPresale;
    // The block number when IPSO ends
    uint256 public startClaim;
    // total amount of GLB needed to be migrating
    uint256 public requiredGLB;
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
    address[] public bondGLBList;
    address[] public bondGLBBUSDList;
    address[] public bondGLBBNBList;
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
      uint256 _requiredWGLBD,
      uint256 _requiredGLB,
      uint256 _maxInvestment,
      uint256 _raisingAmount
  ) {
      wGLBD = _wGLBD;
      investmentToken = _investmentToken;
      startPresale = _startPresale;
      endPresale = _endPresale;
      startClaim = _startClaim;
      requiredWGLBD = _requiredWGLBD;
      requiredGLB = _requiredGLB;
      maxInvestment = _maxInvestment;
      raisingAmount= _raisingAmount;
      totalAmountInvested = 0;
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

    function setRequiredWGLBD(uint256 _requiredWGLBD) public onlyOwner {
        requiredWGLBD = _requiredWGLBD;
    }

    function setRequiredGLB(uint256 _requiredGLB) public onlyOwner {
        requiredGLB = _requiredGLB;
    }

    function setMaxInvestment(uint256 _maxInvestment) public onlyOwner {
        maxInvestment = _maxInvestment;
    }

    function setRaisingAmount(uint256 _raisingAmount) public onlyOwner {
        raisingAmount = _raisingAmount;
    }

    function addBond(uint _typeBond, address _bond) public onlyOwner {
        if(_typeBond==1)
        {
            bondGLBList.push(_bond);
        }
        else if(_typeBond==2)
        {
            bondGLBBUSDList.push(_bond);
        }
        else if(_typeBond==3)
        {
            bondGLBBNBList.push(_bond);
        }
    }

    function deleteBond(uint _typeBond, address _bond) public onlyOwner {
        if(_typeBond==1)
        {
            for (uint8 i = 0; i < bondGLBList.length; i++) {
                if (bondGLBList[i] == _bond) {
                    for (uint j = i; j<bondGLBList.length-1; j++)
                    {
                        bondGLBList[j] = bondGLBList[j+1];
                    }
                    bondGLBList.pop();
                }
            }
        }
        else if(_typeBond==2)
        {
            for (uint8 i = 0; i < bondGLBBUSDList.length; i++) {
                if (bondGLBBUSDList[i] == _bond) {
                    for (uint j = i; j<bondGLBBUSDList.length-1; j++)
                    {
                        bondGLBBUSDList[j] = bondGLBBUSDList[j+1];
                    }
                    bondGLBBUSDList.pop();
                }
            }
        }
        else if(_typeBond==3)
        {
            for (uint8 i = 0; i < bondGLBBNBList.length; i++) {
                if (bondGLBBNBList[i] == _bond) {
                    for (uint j = i; j<bondGLBBNBList.length-1; j++)
                    {
                        bondGLBBNBList[j] = bondGLBBNBList[j+1];
                    }
                    bondGLBBNBList.pop();
                }
            }
        }
    }

    function amountGLBMigrating(address _user) public view returns (uint)
    {
        uint amountMigrating = 0;
        uint newAmount = 0;
        for (uint8 i = 0; i < bondGLBList.length; i++) {
            (newAmount,,,,,,) = BondDepositoryGlb(bondGLBList[i]).bondInfo(_user);
            amountMigrating = amountMigrating.add(newAmount);
        }
        for (uint8 i = 0; i < bondGLBBUSDList.length; i++) {
            (,newAmount,,,,,,) = BondDepositoryGlbBusdLP(bondGLBBUSDList[i]).bondInfo(_user);
            amountMigrating = amountMigrating.add(newAmount.mul(2));
        }
        for (uint8 i = 0; i < bondGLBBNBList.length; i++) {
            (,newAmount,,,,,,) = BondDepositoryGlbBnbLP(bondGLBBNBList[i]).bondInfo(_user);
            amountMigrating = amountMigrating.add(newAmount.mul(2));
        }
        return amountMigrating;
    }

    function canInvest(address _user) public view returns (bool)
    {
        return isWhitelist(_user) || amountGLBMigrating(_user)>=requiredGLB;
    }

    function invest(uint256 _amount) public
    {
        require (block.timestamp > startPresale && block.timestamp < endPresale, 'not presale time');
        require (_amount > 0, 'need _amount > 0');
        require (userInfo[msg.sender].depositedInvestmentTokens.add(_amount) <= maxInvestment, 'you cannot invest more');
        bool canInv = canInvest(msg.sender);
        require (canInv || IERC20(wGLBD).balanceOf(msg.sender)>=requiredWGLBD, 'you cannot invest'); //
        require (!isBlacklist(msg.sender), 'YOU cannot invest'); //

        if(!canInv)
        {
            IERC20(wGLBD).safeTransferFrom(address(msg.sender), address(this), requiredWGLBD);
            userInfo[msg.sender].depositedWGLBD = requiredWGLBD;
            userInfo[msg.sender].remainingWGLBD = requiredWGLBD;
            userInfo[msg.sender].depositWGLBD = true;
        }
        else if(whitelist[msg.sender])
        {
            userInfo[msg.sender].whitelisted = true;
        }
        else
        {
            userInfo[msg.sender].migrateGLB = true;
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
        uint256 excessInvestment = userInfo[_user].depositedInvestmentTokens.sub(payAmount).sub(userInfo[_user].refundedInvestmentTokens);
        return excessInvestment>DUST?excessInvestment:0;
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

        IERC20(wGLBD).safeTransferFrom(address(this),_depositor, transferAmount);

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
        uint256 amountBlocked = totalAmountInvested > raisingAmount ? totalAmountInvested - raisingAmount : 0;
        require (_amount <= IBEP20(investmentToken).balanceOf(address(this)).sub(amountBlocked), 'not enough investment tokens');
        IBEP20(investmentToken).safeTransfer(address(msg.sender), _amount);
    }

    function withdrawInvestmentToken() public onlyOwner {
        uint256 amountBlocked = totalAmountInvested > raisingAmount ? totalAmountInvested - raisingAmount : 0;
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