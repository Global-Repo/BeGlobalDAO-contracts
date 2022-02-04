// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

import './Modifiers/IOwnable.sol';
import './Modifiers/Ownable.sol';
import './Libraries/SafeMath.sol';
import './Libraries/SafeERC20.sol';
import './Libraries/Address.sol';
import './Tokens/IERC20.sol';
import './Tokens/IBEP20.sol';
import './IStaking.sol';
import './StakingHelper.sol';

contract BondDepositoryGlb is Ownable {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    address public glbd;
    address public glb;
    address public stakingHelper;

    uint public bondHarvestTime;
    uint public bondRatio;
    uint public bondMaxDeposit;
    uint public totalDebt;

    mapping( address => Bond ) public bondInfo; // stores bond information for depositors

    // Info for bond holder
    struct Bond {
        uint deposited; // GLBs deposited
        uint payout; // Total GLBD to be paid
        uint payoutRemaining; // GLBD remaining to be paid
        uint depositTime; // Timestamp on deposit
        uint harvestTime; // HarvestTime on deposit
        uint ratio; // For front end viewing
        uint maxDeposit; // For front end viewing
    }

    event BondCreated(address indexed _depositor, uint deposited, uint totalDeposited, uint payout, uint totalPayout, uint harvestTime, uint ratioLP);
    event BondRedeemed( address indexed _depositor, uint amountTransfered, uint remaining, uint payout );

    constructor(
        address _glbd,
        address _glb,
        address _stakingHelper,
        uint _bondHarvestTime,
        uint _bondRatio,
        uint _bondMaxDeposit
    ) {
        glbd = _glbd;
        glb = _glb;
        stakingHelper = _stakingHelper;
        bondHarvestTime = _bondHarvestTime;
        bondRatio = _bondRatio;
        bondMaxDeposit = _bondMaxDeposit;
        totalDebt = 0;

        IERC20( glbd ).approve(_stakingHelper, uint(0));
        IERC20( glbd ).approve(_stakingHelper, uint(~0));
    }

    function setBondHarvestTime( uint _bondHarvestTime ) external onlyOwner {
        bondHarvestTime = _bondHarvestTime;
    }

    function setBondRatio( uint _bondRatio ) external onlyOwner {
        require( _bondRatio > 0, "Invalid parameter" );
        bondRatio = _bondRatio;
    }

    function setBondMaxDeposit( uint _bondMaxDeposit ) external onlyOwner {
        bondMaxDeposit = _bondMaxDeposit;
    }

    function deposit(
        uint _amount,
        address _depositor
    ) external returns ( uint ) {
        require(  bondInfo[ _depositor ].deposited < bondMaxDeposit, "You cannot deposit more tokens" );
        require( _depositor != address(0), "Invalid address" );

        uint amount = bondMaxDeposit.sub(bondInfo[ _depositor ].deposited)>_amount ? _amount : bondMaxDeposit.sub(bondInfo[ _depositor ].deposited);

        IBEP20(glb).transferFrom( msg.sender, address(this), amount );

        uint actualPayout = amount.div(bondRatio);
        actualPayout = actualPayout.mul( 10 ** IERC20( glbd ).decimals() ).div( 10 ** IBEP20( glb ).decimals());

        require( actualPayout <= excessReserves(), "Not enough GLBDs available" );

        bondInfo[ _depositor ] = Bond({
            deposited: bondInfo[ _depositor ].deposited.add(amount),
            payout: bondInfo[ _depositor ].payoutRemaining.add( actualPayout ),
            payoutRemaining: bondInfo[ _depositor ].payoutRemaining.add( actualPayout ),
            depositTime: block.timestamp,
            harvestTime: bondHarvestTime,
            maxDeposit: bondMaxDeposit,
            ratio: bondRatio
        });

        // total debt is increased
        totalDebt = totalDebt.add( actualPayout );

        // indexed events are emitted
        emit BondCreated( _depositor, amount, bondInfo[ _depositor ].deposited , actualPayout,  bondInfo[ _depositor ].payout, bondHarvestTime, bondRatio );

        return actualPayout;
    }

    function redeem(
        address _depositor
    ) external returns ( uint ) {
        uint transferAmount = availableToRedeem(_depositor);
        require(transferAmount>0,"[There's no more GLBD to be claimed]");

        StakingHelper(stakingHelper).stake(transferAmount, _depositor);

        uint newPayoutRemaining = bondInfo[ _depositor ].payoutRemaining.sub(transferAmount);
        if(newPayoutRemaining==0)
        {
            delete bondInfo[ _depositor ];
        }
        else
        {
            bondInfo[ _depositor ].payoutRemaining = newPayoutRemaining;
        }

        // total debt is decreased
        totalDebt = totalDebt.sub( transferAmount );

        // indexed events are emitted
        emit BondRedeemed( _depositor, transferAmount, bondInfo[ _depositor ].payoutRemaining, bondInfo[ _depositor ].payout);

        return transferAmount;
    }

    function recoverRewardTokens(uint _amount) external onlyOwner {
        require(IERC20(glbd).balanceOf(address(this)).sub(totalDebt)>=_amount, "Not enough GLBDs available");
        IERC20(glbd).transfer(address(msg.sender), _amount);
    }

    function recoverRewardTokens() external onlyOwner {
        IERC20(glbd).transfer(address(msg.sender), IERC20(glbd).balanceOf(address(this)).sub(totalDebt));
    }

    function recoverReserveToken(uint _amount) external onlyOwner {
        IBEP20(glb).transfer(address(msg.sender), _amount);
    }

    function recoverReserveToken() external onlyOwner {
        IBEP20 token = IBEP20(glb);
        token.transfer(address(msg.sender), token.balanceOf(address(this)));
    }

    function recoverWrontToken(address _token) external onlyOwner {
        IBEP20 token = IBEP20(_token);
        token.transfer(address(msg.sender), token.balanceOf(address(this)));
    }

    function excessReserves() public view returns ( uint ) {
        return IERC20(glbd).balanceOf(address(this)).sub( totalDebt );
    }

    function availableToDeposit(address _depositor) public view returns ( uint ) {
        return bondMaxDeposit.sub(bondInfo[ _depositor ].deposited);
    }

    function availableToRedeem(address _depositor) public view returns ( uint ) {
        Bond memory depositoryBond = bondInfo[ _depositor ];

        uint harvestingAmount = 0;
        if(depositoryBond.depositTime.add(depositoryBond.harvestTime)>block.timestamp && depositoryBond.harvestTime>0)
        {
            harvestingAmount = depositoryBond.payout.mul(depositoryBond.depositTime.add(depositoryBond.harvestTime).sub(block.timestamp)).div(depositoryBond.harvestTime);
        }

        return depositoryBond.payoutRemaining.sub(harvestingAmount);
    }
}