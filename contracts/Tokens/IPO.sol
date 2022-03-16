// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import './IBEP20.sol';
import '../Libraries/SafeMath.sol';
import '../Libraries/SafeBEP20.sol';
import '../Modifiers/ReentrancyGuard.sol';
import '../Modifiers/Ownable.sol';

/**
 * Initial Public Offering
 *
 */
contract IPO is ReentrancyGuard, Ownable {
  using SafeMath for uint256;
  using SafeBEP20 for IBEP20;

  // Info of each user.
  struct UserInfo {
    uint256 amountInvestedWhitelist;   // How many tokens the user has invested in whitelist.
    uint256 amountInvestedPublicSale;   // How many tokens the user has invested in public sale.
    uint256 amountToBeClaimed;   // Total amount of tokens to be claimed.
    uint256 amountRemaining;   // Total amount of tokens still remaining to be claimed.
    bool claimed;  // default false
  }

  // The investment token
  address public investmentToken;
  // The project token
  address public projectToken;
  // The timestamp of the whitelist start
  uint256 public startWhitelist;
  // The timestamp of the whitelist end
  uint256 public endWhitelist;
  // The timestamp of the public sale start
  uint256 public startPublicSale;
  // The timestamp of the public sale end
  uint256 public endPublicSale;
  // The timestamp of the claim start
  uint256 public startClaim;
  // The timestamp of the claim end
  uint256 public endClaim;

  //ratio of projectTokens/investmentTokens
  uint256 public ratioNumWhitelist;
  uint256 public ratioDenumWhitelist;
  //max investment per wallet
  uint256 public maxInvestmentWhitelist;
  // total amount of investment tokens need to be raised
  uint256 public raisingAmountWhitelist;
  // total amount of investment tokens that have already raised
  uint256 public investedAmountWhitelist;

  //ratio of projectTokens/investmentTokens
  uint256 public ratioNumPublicSale;
  uint256 public ratioDenumPublicSale;
  //max investment per wallet
  uint256 public maxInvestmentPublicSale;
  // total amount of investment tokens need to be raised
  uint256 public raisingAmountPublicSale;
  // total amount of investment tokens that have already raised
  uint256 public investedAmountPublicSale;

  // total amount of project tokens of lost bonuses
  uint256 public excessProjectTokens;

  // address => amount
  mapping (address => UserInfo) public userInfo;
  // participators
  address[] public addressList;
  mapping (address => bool) private whitelist;

  event Invest(address indexed user, uint256 amount);
  event Claim(address indexed user, uint256 amount);

  constructor(
    address _investmentToken,
    uint256 _startWhitelist,
    uint256 _endWhitelist,
    uint256 _startPublicSale,
    uint256 _endPublicSale,
    uint256 _startClaim,
    uint256 _endClaim,
    uint256 _ratioNumWhitelist,
    uint256 _ratioDenumWhitelist,
    uint256 _maxInvestmentWhitelist,
    uint256 _raisingAmountWhitelist,
    uint256 _ratioNumPublicSale,
    uint256 _ratioDenumPublicSale,
    uint256 _maxInvestmentPublicSale,
    uint256 _raisingAmountPublicSale
  ) {
    investmentToken = _investmentToken;

    startWhitelist = _startWhitelist;
    endWhitelist = _endWhitelist;
    startPublicSale = _startPublicSale;
    endPublicSale = _endPublicSale;
    startClaim = _startClaim;
    endClaim = _endClaim;

    ratioNumWhitelist = _ratioNumWhitelist;
    ratioDenumWhitelist = _ratioDenumWhitelist;
    maxInvestmentWhitelist = _maxInvestmentWhitelist;
    raisingAmountWhitelist = _raisingAmountWhitelist;
    investedAmountWhitelist = 0;

    ratioNumPublicSale = _ratioNumPublicSale;
    ratioDenumPublicSale = _ratioDenumPublicSale;
    maxInvestmentPublicSale = _maxInvestmentPublicSale;
    raisingAmountPublicSale = _raisingAmountPublicSale;
    investedAmountPublicSale = 0;

    excessProjectTokens = 0;
  }

  function setProjectToken(address _projectToken) public onlyOwner {
    projectToken = _projectToken;
  }

  function setStartWhitelist(uint256 _startWhitelist) public onlyOwner {
    startWhitelist = _startWhitelist;
  }

  function setEndWhitelist(uint256 _endWhitelist) public onlyOwner {
    endWhitelist = _endWhitelist;
  }

  function setStartPublicSale(uint256 _startPublicSale) public onlyOwner {
    startPublicSale = _startPublicSale;
  }

  function setEndPublicSale(uint256 _endPublicSale) public onlyOwner {
    endPublicSale = _endPublicSale;
  }

  function setStartClaim(uint256 _startClaim) public onlyOwner {
    startClaim = _startClaim;
  }

  function setEndClaim(uint256 _endClaim) public onlyOwner {
    endClaim = _endClaim;
  }

  function setRatioNumWhitelist(uint256 _ratioNumWhitelist) public onlyOwner {
    ratioNumWhitelist = _ratioNumWhitelist;
  }

  function setRatioDenumWhitelist(uint256 _ratioDenumWhitelist) public onlyOwner {
    ratioDenumWhitelist = _ratioDenumWhitelist;
  }

  function setMaxInvestmentWhitelist(uint256 _maxInvestmentWhitelist) public onlyOwner {
    maxInvestmentWhitelist = _maxInvestmentWhitelist;
  }

  function setRaisingAmountWhitelist(uint256 _raisingAmountWhitelist) public onlyOwner {
    raisingAmountWhitelist = _raisingAmountWhitelist;
  }

  function setRatioNumPublicSale(uint256 _ratioNumPublicSale) public onlyOwner {
    ratioNumPublicSale = _ratioNumPublicSale;
  }

  function setRatioDenumPublicSale(uint256 _ratioDenumPublicSale) public onlyOwner {
    ratioDenumPublicSale = _ratioDenumPublicSale;
  }

  function setMaxInvestmentPublicSale(uint256 _maxInvestmentPublicSale) public onlyOwner {
    maxInvestmentPublicSale = _maxInvestmentPublicSale;
  }

  function setRaisingAmountPublicSale(uint256 _raisingAmountPublicSale) public onlyOwner {
    raisingAmountPublicSale = _raisingAmountPublicSale;
  }

  function isWhitelist(address _address) public view returns(bool) {
    return whitelist[_address];
  }

  function setWhitelist(address _address) external onlyOwner {
    whitelist[_address] = !whitelist[_address];
  }

  function availableToInvest(address user) public view returns(uint256) {
    uint256 maxInvestPerUser;
    if(whitelist[user] && block.timestamp > startWhitelist && block.timestamp < endWhitelist)
    {
      maxInvestPerUser = maxInvestmentWhitelist.sub(userInfo[user].amountInvestedWhitelist);
      maxInvestPerUser = maxInvestPerUser < raisingAmountWhitelist.sub(investedAmountWhitelist) ? maxInvestPerUser : raisingAmountWhitelist.sub(investedAmountWhitelist);
    }
    else if(block.timestamp > startPublicSale && block.timestamp < endPublicSale)
    {
      maxInvestPerUser = maxInvestmentPublicSale.sub(userInfo[user].amountInvestedPublicSale);
      maxInvestPerUser = maxInvestPerUser < raisingAmountPublicSale.sub(investedAmountPublicSale) ? maxInvestPerUser : raisingAmountPublicSale.sub(investedAmountPublicSale);
    }
    else
    {
      maxInvestPerUser = 0;
    }
    return maxInvestPerUser;
  }

  function invest(uint256 _amount) public {
    require ((whitelist[msg.sender] && block.timestamp > startWhitelist && block.timestamp < endWhitelist)
    || (block.timestamp > startPublicSale && block.timestamp < endPublicSale), 'not ipo time');
    require (_amount > 0, 'need amount > 0');
    require (_amount < availableToInvest(msg.sender), 'too much amount');

    IBEP20(investmentToken).safeTransferFrom(address(msg.sender), address(this), _amount);

    if (userInfo[msg.sender].amountToBeClaimed == 0)
    {
      addressList.push(address(msg.sender));
    }

    if(whitelist[msg.sender] && block.timestamp > startWhitelist && block.timestamp < endWhitelist)
    {
      userInfo[msg.sender].amountInvestedWhitelist = userInfo[msg.sender].amountInvestedWhitelist.add(_amount);
      userInfo[msg.sender].amountToBeClaimed = userInfo[msg.sender].amountToBeClaimed.add(_amount.mul(ratioNumWhitelist).div(ratioDenumWhitelist));
      investedAmountWhitelist = investedAmountWhitelist.add(_amount);
    }
    else if(block.timestamp > startPublicSale && block.timestamp < endPublicSale)
    {
      userInfo[msg.sender].amountInvestedPublicSale = userInfo[msg.sender].amountInvestedPublicSale.add(_amount);
      userInfo[msg.sender].amountToBeClaimed = userInfo[msg.sender].amountToBeClaimed.add(_amount.mul(ratioNumPublicSale).div(ratioDenumPublicSale));
      investedAmountPublicSale = investedAmountPublicSale.add(_amount);
    }

    emit Invest(msg.sender, _amount);
  }

  function actualBonus() public view returns (uint) {
      if(block.timestamp > endClaim)
      {
        return 20;
      }
      else if(block.timestamp > startClaim.add((endClaim.sub(startClaim)).mul(3).div(4)))
      {
        return 15;
      }
      else if(block.timestamp > startClaim.add((endClaim.sub(startClaim)).div(2)))
      {
        return 10;
      }
      else if(block.timestamp > startClaim.add((endClaim.sub(startClaim)).mul(1).div(4)))
      {
        return 5;
      }
      else
      {
        return 0;
      }
  }

  function availableBonus(address _user) public view returns ( uint )
  {
    return userInfo[ _user ].claimed ? 0 : userInfo[ _user ].amountToBeClaimed.mul(actualBonus()).div(100);
  }

  function availableToClaim(address _user) public view returns ( uint ) {
    uint256 amountToBeClaimed = userInfo[ _user ].amountToBeClaimed;

    if(!userInfo[ _user ].claimed)
    {
      amountToBeClaimed = amountToBeClaimed.mul(actualBonus()).div(100);
    }

    uint harvestingAmount = 0;
    if(startClaim>block.timestamp)
    {
      harvestingAmount = amountToBeClaimed;
    }
    else if(endClaim>block.timestamp)
    {
      harvestingAmount = amountToBeClaimed
      .mul(endClaim.sub(block.timestamp))
      .div(endClaim.sub(startClaim));
    }

    return userInfo[ _user ].amountRemaining.sub(harvestingAmount);
  }

  function claim(address _user) public nonReentrant {
    require (block.number > startClaim, 'not claim time');
    require (userInfo[_user].amountToBeClaimed > 0, 'have you participated?');
    uint transferAmount = availableToClaim(_user);
    require (transferAmount > 0, 'nothing to claim');

    if(!userInfo[_user].claimed)
    {
      if(block.timestamp<endClaim)
      {
        excessProjectTokens = excessProjectTokens.add(userInfo[_user].amountToBeClaimed.mul(actualBonus()).sub(userInfo[_user].amountToBeClaimed.add(availableBonus(_user))));
      }
      userInfo[_user].amountToBeClaimed = userInfo[_user].amountToBeClaimed.add(availableBonus(_user));
      userInfo[_user].claimed = true;
    }

    IBEP20(projectToken).safeTransfer(_user, transferAmount);

    userInfo[_user].amountRemaining = userInfo[_user].amountRemaining.sub(transferAmount);

    emit Claim(_user, transferAmount);
  }

  function burnExcessProjectTokens() public onlyOwner {
    IBEP20(projectToken).safeTransfer(address(0x000000000000000000000000000000000000dEaD), excessProjectTokens);
    excessProjectTokens = 0;
  }

  function burnExcessProjectTokens(uint256 _amount) public onlyOwner {
    require(_amount <= excessProjectTokens, 'not enough excess of project tokens');
    IBEP20(projectToken).safeTransfer(address(0x000000000000000000000000000000000000dEaD), _amount);
    excessProjectTokens = excessProjectTokens.sub(_amount);
  }

  function getAddressListLength() external view returns(uint256) {
    return addressList.length;
  }

  function withdrawInvestmentTokens(uint256 _amount) public onlyOwner {
    require (_amount <= IBEP20(investmentToken).balanceOf(address(this)), 'not enough token');
    IBEP20(investmentToken).safeTransfer(address(msg.sender), _amount);
  }

  function withdrawInvestmentTokens() public onlyOwner {
    require (0 < IBEP20(investmentToken).balanceOf(address(this)), 'not enough token');
    IBEP20(investmentToken).safeTransfer(address(msg.sender), IBEP20(investmentToken).balanceOf(address(this)));
  }

  function withdrawProjectTokens(uint256 _amount) public onlyOwner {
    require (_amount <= IBEP20(projectToken).balanceOf(address(this)), 'not enough token');
    IBEP20(projectToken).safeTransfer(address(msg.sender), _amount);
  }

  function withdrawProjectTokens() public onlyOwner {
    require (0 < IBEP20(projectToken).balanceOf(address(this)), 'not enough token');
    IBEP20(projectToken).safeTransfer(address(msg.sender), IBEP20(projectToken).balanceOf(address(this)));
  }
}