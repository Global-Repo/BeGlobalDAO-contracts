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
contract IPOVesting is ReentrancyGuard, Ownable {
  using SafeMath for uint256;
  using SafeBEP20 for IBEP20;

  // Info of each user.
  struct UserInfo {
    uint256 amountToBeClaimed;   // Total amount of tokens to be claimed.
    uint256 amountRemaining;   // Total amount of tokens still remaining to be claimed.
    uint256 startClaim;   // Start of claim time.
    uint256 endClaim;   // End of claim time.
  }

  // The project token
  address public projectToken;

  // address => amount
  mapping (address => UserInfo) public userInfo;
  // participators
  address[] public addressList;

  event Claim(address indexed user, uint256 amount);

  constructor(
  ) {

  }

  function setProjectToken(address _projectToken) public onlyOwner {
    projectToken = _projectToken;
  }

  function addUser(uint256 _amount, uint256 _startClaim, uint256 _endClaim) public onlyOwner {
    require (_startClaim < _endClaim, 'incorrect claim time');
    require (_amount > 0, 'need amount > 0');

    IBEP20(projectToken).safeTransferFrom(address(msg.sender), address(this), _amount);

    if (userInfo[msg.sender].amountToBeClaimed == 0)
    {
      addressList.push(address(msg.sender));
    }

    userInfo[msg.sender].amountToBeClaimed = userInfo[msg.sender].amountToBeClaimed.add(_amount);
    userInfo[msg.sender].amountRemaining = userInfo[msg.sender].amountRemaining.add(_amount);
    userInfo[msg.sender].startClaim = _startClaim;
    userInfo[msg.sender].endClaim = _endClaim;
  }

  function availableToClaim(address _user) public view returns ( uint ) {
    UserInfo memory user = userInfo[ _user ];

    uint harvestingAmount = 0;
    if(user.startClaim>block.timestamp)
    {
      harvestingAmount = user.amountToBeClaimed;
    }
    else if(user.endClaim>block.timestamp)
    {
      harvestingAmount = user.amountToBeClaimed
      .mul((user.endClaim).sub(block.timestamp))
      .div((user.endClaim).sub(user.startClaim));
    }

    return userInfo[ _user ].amountRemaining.sub(harvestingAmount);
  }

  function claim(address _user) public nonReentrant {
    require (block.number > userInfo[_user].startClaim, 'not claim time');
    require (userInfo[_user].amountToBeClaimed > 0, 'have you participated?');

    uint transferAmount = availableToClaim(_user);
    require (transferAmount > 0, 'nothing to claim');

    IBEP20(projectToken).safeTransfer(_user, transferAmount);

    userInfo[_user].amountRemaining = userInfo[_user].amountRemaining.sub(transferAmount);

    emit Claim(_user, transferAmount);
  }

  function claim() public nonReentrant {
    claim(msg.sender);
  }

  function getAddressListLength() external view returns(uint256) {
    return addressList.length;
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