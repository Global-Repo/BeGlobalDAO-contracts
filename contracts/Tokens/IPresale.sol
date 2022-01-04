// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

interface IPresale {
    event TokensBought(address buyer, uint256 amount, uint256 busdAcc);
    event AdminTokenRecovery(address tokenRecovered, uint256 amount);

    function getBusdAcc() external view returns (uint);

    function getStatus() external view returns (bool);
    function getQuantityBought(address buyer) external view returns(uint);
    function getBuyer(uint position) external view returns(address);
    function getBuyers() external view returns(address[] memory);
    function getQuantities() external view returns(uint[] memory);
}
