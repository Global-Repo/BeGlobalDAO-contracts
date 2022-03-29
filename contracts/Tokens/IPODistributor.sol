// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import './IPO.sol';
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
contract IPODistributor is ReentrancyGuard, Ownable, WorkerTownable {
  using SafeMath for uint256;
  using SafeBEP20 for IBEP20;
  using SafeERC20 for IERC20;

  // Info of each user.
  struct UserInfo {
    uint256 amountToBeClaimed;   // Total amount of tokens to be claimed.
    uint256 amountRemaining;   // Total amount of tokens still remaining to be claimed.
    bool claimed;  // default false
  }

  // The project token
  address public projectToken;
  // The timestamp of the claim start
  uint256 public startClaim;
  // The timestamp of the claim end
  uint256 public endClaim;

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
  mapping (address => bool) private blacklist;

  event InvestorsLoaded(uint256 amount);
  event Claim(address indexed user, uint256 amount);

  constructor(
    address _projectToken,
    uint256 _startClaim,
    uint256 _endClaim
  ) {
    projectToken = _projectToken;

    startClaim = _startClaim;
    endClaim = _endClaim;

    excessProjectTokens = 0;
    burnAddress = address(0xa16856c6CeDf2FAc6A926193E634D20f3b266571);
    excessBurned = false;
  }

  function setStartClaim(uint256 _startClaim) public onlyOwner {
    startClaim = _startClaim;
  }

  function setEndClaim(uint256 _endClaim) public onlyOwner {
    endClaim = _endClaim;
  }

  function isBlacklist(address _address) public view returns(bool) {
    return blacklist[_address];
  }

  function setBlacklist(address _address) external onlyOwner {
    blacklist[_address] = !blacklist[_address];
  }

  function setBlacklist(address[] calldata addrs) external onlyOwner {
    for (uint256 i = 0; i < addrs.length; i++) {
      blacklist[addrs[i]] = !blacklist[addrs[i]];
    }
  }

  function loadInvestors(address _address) external onlyOwner {

    IPO ipo = IPO(_address);

    uint numUsers = ipo.getAddressListLength();
    for( uint i = 0; i < numUsers; i++ ) {
      address userAddress = ipo.addressList(i);
      addressList.push(userAddress);
      (,,userInfo[userAddress].amountToBeClaimed,userInfo[userAddress].amountRemaining,userInfo[userAddress].claimed) = ipo.userInfo(userAddress);
    }

    emit InvestorsLoaded(numUsers);
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
    if(isBlacklist(_user))
    {
      return 0;
    }
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
    require (isBlacklist(_user), 'you cannot claim');
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
    burnExcessProjectTokens(excessProjectTokens);
  }

  function burnExcessProjectTokens(uint256 _amount) public onlyWorkerTown {
    require(_amount <= excessProjectTokens, 'not enough excess of project tokens');
    IERC20(projectToken).safeTransfer(address(burnAddress), _amount);
    excessProjectTokens = excessProjectTokens.sub(_amount);
  }

  function getAddressListLength() external view returns(uint256) {
    return addressList.length;
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