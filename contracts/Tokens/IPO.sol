// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import './IBEP20.sol';
import '../Libraries/SafeBEP20.sol';
import "../Libraries/SafeERC20.sol";
import '../Libraries/SafeMath.sol';
import '../Modifiers/Ownable.sol';
import "../Modifiers/WorkerTownable.sol";
import '../Modifiers/ReentrancyGuard.sol';

/**
 * Initial Public Offering
 *
 */
contract IPO is ReentrancyGuard, Ownable, WorkerTownable {
  using SafeMath for uint256;
  using SafeBEP20 for IBEP20;
  using SafeERC20 for IERC20;

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
  // address to burn the excess of project tokens
  address public burnAddress;
  // have been the tokens not sold burned
  bool public excessBurned;

  // address => amount
  mapping (address => UserInfo) public userInfo;
  // participators
  address[] public addressList;
  mapping (address => bool) private whitelist;

  event Invest(address indexed user, uint256 amount);
  event Claim(address indexed user, uint256 amount);

  constructor(
    address _investmentToken,
    address _projectToken,
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
    projectToken = _projectToken;

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
    burnAddress = address(0xa16856c6CeDf2FAc6A926193E634D20f3b266571);
    excessBurned = false;
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

  function setWhitelist(address[] calldata addrs) external onlyOwner {
    for (uint256 i = 0; i < addrs.length; i++) {
      whitelist[addrs[i]] = !whitelist[addrs[i]];
    }
  }

  function availableToInvest(address user) public view returns(uint256) {
    uint256 maxInvestPerUser = 0;
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
    return maxInvestPerUser;
  }

  function invest(uint256 _amount) public nonReentrant {
    require (_amount > 0, 'need amount > 0');
    require (_amount <= availableToInvest(msg.sender), 'too much amount');

    IBEP20(investmentToken).safeTransferFrom(address(msg.sender), address(this), _amount);

    if (userInfo[msg.sender].amountToBeClaimed == 0)
    {
      addressList.push(address(msg.sender));
    }

    if(whitelist[msg.sender] && block.timestamp > startWhitelist && block.timestamp < endWhitelist)
    {
      userInfo[msg.sender].amountInvestedWhitelist = userInfo[msg.sender].amountInvestedWhitelist.add(_amount);
      userInfo[msg.sender].amountToBeClaimed = userInfo[msg.sender].amountToBeClaimed.add(_amount.mul(ratioNumWhitelist).div(ratioDenumWhitelist));
      userInfo[msg.sender].amountRemaining = userInfo[msg.sender].amountRemaining.add(_amount.mul(ratioNumWhitelist).div(ratioDenumWhitelist));
      investedAmountWhitelist = investedAmountWhitelist.add(_amount);
    }
    else if(block.timestamp > startPublicSale && block.timestamp < endPublicSale)
    {
      userInfo[msg.sender].amountInvestedPublicSale = userInfo[msg.sender].amountInvestedPublicSale.add(_amount);
      userInfo[msg.sender].amountToBeClaimed = userInfo[msg.sender].amountToBeClaimed.add(_amount.mul(ratioNumPublicSale).div(ratioDenumPublicSale));
      userInfo[msg.sender].amountRemaining = userInfo[msg.sender].amountRemaining.add(_amount.mul(ratioNumPublicSale).div(ratioDenumPublicSale));
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

  function availableToClaim(address _user) public view returns ( uint ) {
    uint256 amountToBeClaimed = userInfo[ _user ].amountToBeClaimed;
    uint256 amountRemaining = userInfo[ _user ].amountRemaining;

    if(!userInfo[ _user ].claimed)
    {
      amountToBeClaimed = amountToBeClaimed.mul(actualBonus().add(100)).div(100);
      amountRemaining = amountToBeClaimed;
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

    return amountRemaining.sub(harvestingAmount);
  }

  function claim(address _user) public nonReentrant {
    require (block.timestamp > startClaim, 'not claim time');
    require (userInfo[_user].amountToBeClaimed > 0, 'have you participated?');
    require (userInfo[_user].amountRemaining > 0, 'you have nothing left');

    uint transferAmount = availableToClaim(_user);
    require (transferAmount > 0, 'nothing to claim');

    if(!userInfo[_user].claimed)
    {
      if(block.timestamp<endClaim)
      {
        uint maxBonusAmount = userInfo[_user].amountToBeClaimed.mul(120).div(100);
        uint actualBonusAmount = userInfo[_user].amountToBeClaimed.mul(actualBonus().add(100)).div(100);
        excessProjectTokens = excessProjectTokens.add(maxBonusAmount.sub(actualBonusAmount));
      }

      userInfo[_user].amountToBeClaimed = userInfo[_user].amountToBeClaimed.mul(actualBonus().add(100)).div(100);
      userInfo[_user].amountRemaining = userInfo[_user].amountToBeClaimed;
      userInfo[_user].claimed = true;
    }

    IERC20(projectToken).safeTransfer(_user, transferAmount);

    userInfo[_user].amountRemaining = userInfo[_user].amountRemaining.sub(transferAmount);

    emit Claim(_user, transferAmount);
  }

  function burnExcessProjectTokens() public onlyWorkerTown {
    if(!excessBurned && block.timestamp > endWhitelist && block.timestamp > endPublicSale)
    {
      uint256 excessWhitelistTokens = raisingAmountWhitelist.sub(investedAmountWhitelist).mul(ratioNumWhitelist).div(ratioDenumWhitelist).mul(6).div(5);
      uint256 excessPublicSaleTokens = raisingAmountPublicSale.sub(investedAmountPublicSale).mul(ratioNumPublicSale).div(ratioDenumPublicSale).mul(6).div(5);
      excessProjectTokens = excessProjectTokens.add(excessWhitelistTokens).add(excessPublicSaleTokens);
      excessBurned = true;
    }
    burnExcessProjectTokens(excessProjectTokens);
  }

  function burnExcessProjectTokens(uint256 _amount) public onlyWorkerTown {
    if(!excessBurned && block.timestamp > endWhitelist && block.timestamp > endPublicSale)
    {
      uint256 excessWhitelistTokens = ((raisingAmountWhitelist.sub(investedAmountWhitelist)).mul(ratioNumWhitelist).div(ratioDenumWhitelist)).mul(6).div(5);
      uint256 excessPublicSaleTokens = ((raisingAmountPublicSale.sub(investedAmountPublicSale)).mul(ratioNumPublicSale).div(ratioDenumPublicSale)).mul(6).div(5);
      excessProjectTokens = excessProjectTokens.add(excessWhitelistTokens).add(excessPublicSaleTokens);
      excessBurned = true;
    }
    require(_amount <= excessProjectTokens, 'not enough excess of project tokens');
    IERC20(projectToken).safeTransfer(address(burnAddress), _amount);
    excessProjectTokens = excessProjectTokens.sub(_amount);
  }

  function getAddressListLength() external view returns(uint256) {
    return addressList.length;
  }

  function withdrawInvestmentTokens(uint256 _amount) public onlyWorkerTown {
    require (_amount <= IBEP20(investmentToken).balanceOf(address(this)), 'not enough token');
    require (0 < _amount, 'amount must be > 0');
    IBEP20(investmentToken).safeTransfer(address(msg.sender), _amount);
  }

  function withdrawInvestmentTokens() public onlyWorkerTown {
    require (0 < IBEP20(investmentToken).balanceOf(address(this)), 'not enough token');
    IBEP20(investmentToken).safeTransfer(address(msg.sender), IBEP20(investmentToken).balanceOf(address(this)));
  }

  function withdrawOtherTokens(address _token) public onlyWorkerTown {
    require (_token != projectToken, 'you cannot withdraw the project token');
    require (0 <= IBEP20(_token).balanceOf(address(this)), 'not enough token');
    IBEP20(_token).safeTransfer(address(msg.sender), IBEP20(_token).balanceOf(address(this)));
  }

  function withdrawOtherTokens(address _token, uint256 _amount) public onlyWorkerTown {
    require (_token != projectToken, 'you cannot withdraw the project token');
    require (_amount <= IBEP20(_token).balanceOf(address(this)), 'not enough token');
    IBEP20(_token).safeTransfer(address(msg.sender), _amount);
  }
}