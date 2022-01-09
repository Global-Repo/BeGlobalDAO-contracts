// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

interface IOwnable {
    function policy() external view returns (address);

    function renounceManagement() external;

    function pushManagement( address newOwner_ ) external;

    function pullManagement() external;
}

contract Ownable is IOwnable {

    address internal _owner;
    address internal _newOwner;

    event OwnershipPushed(address indexed previousOwner, address indexed newOwner);
    event OwnershipPulled(address indexed previousOwner, address indexed newOwner);

    constructor () {
        _owner = msg.sender;
        emit OwnershipPushed( address(0), _owner );
    }

    function policy() public view override returns (address) {
        return _owner;
    }

    modifier onlyPolicy() {
        require( _owner == msg.sender, "Ownable: caller is not the owner" );
        _;
    }

    function renounceManagement() public virtual override onlyPolicy() {
        emit OwnershipPushed( _owner, address(0) );
        _owner = address(0);
    }

    function pushManagement( address newOwner_ ) public virtual override onlyPolicy() {
        require( newOwner_ != address(0), "Ownable: new owner is the zero address");
        emit OwnershipPushed( _owner, newOwner_ );
        _newOwner = newOwner_;
    }

    function pullManagement() public virtual override {
        require( msg.sender == _newOwner, "Ownable: must be new owner to pull");
        emit OwnershipPulled( _owner, _newOwner );
        _owner = _newOwner;
    }
}

library SafeMath {

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }

    function sqrrt(uint256 a) internal pure returns (uint c) {
        if (a > 3) {
            c = a;
            uint b = add( div( a, 2), 1 );
            while (b < c) {
                c = b;
                b = div( add( div( a, b ), b), 2 );
            }
        } else if (a != 0) {
            c = 1;
        }
    }
}

library SafeERC20 {
    using SafeMath for uint256;
    using Address for address;

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    function safeApprove(IERC20 token, address spender, uint256 value) internal {

        require((value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).add(value);
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).sub(value, "SafeERC20: decreased allowance below zero");
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function _callOptionalReturn(IERC20 token, bytes memory data) private {

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) { // Return data is optional
            // solhint-disable-next-line max-line-length
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

library Address {

    function isContract(address account) internal view returns (bool) {

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = recipient.call{ value: amount }("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        return _functionCallWithValue(target, data, 0, errorMessage);
    }

    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: value }(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _functionCallWithValue(address target, bytes memory data, uint256 weiValue, string memory errorMessage) private returns (bytes memory) {
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: weiValue }(data);
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }

    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    function functionStaticCall(address target, bytes memory data, string memory errorMessage) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.staticcall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    function functionDelegateCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
        if (success) {
            return returndata;
        } else {
            if (returndata.length > 0) {

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }

    function addressToString(address _address) internal pure returns(string memory) {
        bytes32 _bytes = bytes32(uint256(_address));
        bytes memory HEX = "0123456789abcdef";
        bytes memory _addr = new bytes(42);

        _addr[0] = '0';
        _addr[1] = 'x';

        for(uint256 i = 0; i < 20; i++) {
            _addr[2+i*2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _addr[3+i*2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }

        return string(_addr);

    }
}

interface IERC20 {
    function decimals() external view returns (uint8);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IBEP20 {

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the token decimals.
     */
    function decimals() external view returns (uint8);

    /**
     * @dev Returns the token symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the token name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the bep token owner.
     */
    function getOwner() external view returns (address);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address _owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract BondDepositoryGlb is Ownable {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    uint public constant DUST = 1000;

    address public glbd;
    address public glb;

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
        uint _bondHarvestTime,
        uint _bondRatio,
        uint _bondMaxDeposit
    ) {
        glbd = _glbd;
        glb = _glb;
        bondHarvestTime = _bondHarvestTime;
        bondRatio = _bondRatio;
        bondMaxDeposit = _bondMaxDeposit;
        totalDebt = 0;
    }

    function setBondHarvestTime( uint _bondHarvestTime ) external onlyPolicy {
        bondHarvestTime = _bondHarvestTime;
    }

    function setBondRatio( uint _bondRatio ) external onlyPolicy {
        require( _bondRatio > 0, "Invalid parameter" );
        bondRatio = _bondRatio;
    }

    function setBondMaxDeposit( uint _bondMaxDeposit ) external onlyPolicy {
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
        require(transferAmount>DUST,"[There's no more GLBD to be claimed]");

        IERC20(glbd).safeTransfer(_depositor, transferAmount);

        uint newPayoutRemaining = bondInfo[ _depositor ].payoutRemaining.sub(transferAmount);
        if(newPayoutRemaining<DUST)
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

    function recoverRewardTokens(uint _amount) external onlyPolicy {
        require(IERC20(glbd).balanceOf(address(this)).sub(totalDebt)>=_amount, "Not enough GLBDs available");
        IERC20(glbd).transfer(address(msg.sender), _amount);
    }

    function recoverRewardTokens() external onlyPolicy {
        IERC20(glbd).transfer(address(msg.sender), IERC20(glbd).balanceOf(address(this)).sub(totalDebt));
    }

    function recoverReserveToken(uint _amount) external onlyPolicy {
        IBEP20(glb).transfer(address(msg.sender), _amount);
    }

    function recoverReserveToken() external onlyPolicy {
        IBEP20 token = IBEP20(glb);
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