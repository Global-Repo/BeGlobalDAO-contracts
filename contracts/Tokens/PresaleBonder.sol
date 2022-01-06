// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

import "./IPair.sol";
import "./IPresale.sol";
import "../Libraries/Math.sol";
import '../BondDepository.sol';

contract PresaleBonder is Ownable {
    using SafeMath for uint;
    using SafeMath for uint16;

    address public busd;
    IPair public pair;
    IPresale public presale;
    GlobalDAOBondDepository public bond;

    event BondedREWARDS(uint i, address indexed _user, uint PairAmount);

    constructor(
        address _busd,
        address _pair,
        address _presale,
        address _bond
    ) {
        busd = _busd;
        pair = IPair(_pair);
        presale = IPresale(_presale);
        bond = GlobalDAOBondDepository(_bond);
        pair.approve(_bond, 1000000000000000000000000000);
    }

    function recoverRewardTokens() external onlyPolicy {
        pair.transfer(address(msg.sender), pair.balanceOf(address(this)));
    }

    function bondRewards(uint firstUser, uint lastUser, uint amountToDistribute) public onlyPolicy {
        address actualUser;
        uint busdAcc = presale.getBusdAcc();

        for (uint i=firstUser; i <= lastUser; i++) {
            actualUser = presale.getBuyer(i);

            bond.deposit(amountToDistribute.mul(presale.getQuantityBought(actualUser)).div(busdAcc), 1000000000000000000000000, actualUser);

            emit BondedREWARDS(i,actualUser,presale.getQuantityBought(actualUser).div(busdAcc));
        }
    }
}