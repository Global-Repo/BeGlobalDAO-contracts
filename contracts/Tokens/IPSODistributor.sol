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
contract IPSODistributor is ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;
    using SafeERC20 for IERC20;

    // total amount of investment tokens that have already raised
    uint256 public totalAmount;
    // address => amount
    mapping (address => uint256) public userInfo;
    // participators
    address[] public addressList;

    event Distributed(uint256 amount, uint256 start, uint256 end);

    constructor(
    ) {
      totalAmount = 0;
    }

    function addUser(address _user, uint256 _allocation) external onlyOwner
    {
        totalAmount = totalAmount.add(_allocation);
        if (userInfo[_user] == 0)
        {
            addressList.push(address(_user));
        }
        userInfo[_user] = _allocation;
    }

    function deleteUser(address _user) external onlyOwner
    {
        totalAmount = totalAmount.sub(userInfo[_user]);
        for (uint8 i = 0; i < addressList.length; i++) {
            if (addressList[i] == _user) {
                for (uint j = i; j<addressList.length-1; j++)
                {
                    addressList[j] = addressList[j+1];
                }
                addressList.pop();
            }
        }
        delete userInfo[_user];
    }

    function distributeProjectTokens(address _projectToken, uint _amount, uint256 start, uint256 end) public onlyOwner
    {
        for (uint256 i = start; i <= end; i++)
        {
            IBEP20(_projectToken).safeTransfer(address(addressList[i]), _amount.mul(userInfo[addressList[i]]).div(totalAmount));
        }
        emit Distributed(_amount, start, end);
    }

    function distributeProjectTokens(address _projectToken, uint _amount) public onlyOwner
    {
        distributeProjectTokens(_projectToken,_amount,0,addressList.length-1);
    }

    // allocation 100000 means 0.1(10%), 1 meanss 0.000001(0.0001%), 1000000 means 1(100%)
    function getUserAllocation(address _user) public view returns(uint256) {
    return userInfo[_user].mul(1e12).div(totalAmount).div(1e6);
    }

    // get the amount of IPSO token you will get
    function getDistributingAmount(address _user, uint _amount) public view returns(uint256) {
      uint256 allocation = getUserAllocation(_user);
      return _amount.mul(allocation).div(1e6);
    }

    function getAddressListLength() external view returns(uint256) {
    return addressList.length;
    }

    function recoverWrongTokens(address _tokenAddress, uint256 _tokenAmount) external onlyOwner {
        IBEP20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);
    }

    function recoverWrongTokens(address _tokenAddress) external onlyOwner {
        IBEP20(_tokenAddress).safeTransfer(address(msg.sender), IBEP20(_tokenAddress).balanceOf(address(this)));
    }

    function recoverWrongTokens2(address _tokenAddress, uint256 _tokenAmount) external onlyOwner {
        IERC20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);
    }

    function recoverWrongTokens2(address _tokenAddress) external onlyOwner {
        IERC20(_tokenAddress).safeTransfer(address(msg.sender), IERC20(_tokenAddress).balanceOf(address(this)));
    }
}