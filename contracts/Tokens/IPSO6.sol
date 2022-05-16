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
contract IPSO6 is ReentrancyGuard, Ownable
{
    using SafeMath for uint;
    using SafeBEP20 for IBEP20;
    using SafeERC20 for IERC20;

    uint public constant DUST = 1000;

    // Info of each user.
    struct UserInfo
    {
        uint depositedInvestmentTokens;   // How many tokens the user has provided.
        uint refundedInvestmentTokens;   // How many tokens the user has been refunded.

        uint claimableProjectTokens;

        uint depositedWGLBD;
        uint remainingWGLBD;
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
    uint public startWhitelist;
    // The block number when IPSO ends
    uint public endWhitelist;
    // The block number when IPSO starts
    uint public startPublicSale;
    // The block number when IPSO ends
    uint public endPublicSale;
    // The block number when vesting starts
    uint public startVesting;
    // The block number when vesting ends
    uint public endVesting;
    // numerator ratio of wGLBD needed to be deposited / BUSD invested
    uint public ratioRequiredWGLBDNum;
    // denominator ratio of wGLBD needed to be deposited / BUSD invested
    uint public ratioRequiredWGLBDDen;
    // amount of wglbd equivalent to being whitelisted
    uint public amountForWhitelisted;
    // min amount of WGLB tokens that must lock any user to invest
    uint public minInvestment;
    // max amount of investment tokens that can invest any user
    uint public maxInvestment;
    // total amount of investment tokens need to be raised
    uint public raisingAmount;
    // max amount of investment tokens to be raised
    uint public hardCap;
    // total amount of investment tokens that have already raised
    uint public totalAmountInvested;
    // total amount of investment tokens remaining
    uint public totalAmountInvestedRemaining;
    // address => amount
    mapping (address => UserInfo) public userInfo;
    // participators
    address[] public addressList;
    mapping (address => bool) private whitelist;
    mapping (address => bool) private blacklist;

    event Invest(address indexed user, uint amount);
    event Claim(address indexed user, uint amount);

    constructor(
        address _wGLBD,
        address _investmentToken,
        uint _startWhitelist,
        uint _endWhitelist,
        uint _startPublicSale,
        uint _endPublicSale,
        uint _startVesting,
        uint _endVesting,
        uint _ratioRequiredWGLBDNum,
        uint _ratioRequiredWGLBDDen,
        uint _amountForWhitelisted,
        uint _minInvestment,
        uint _maxInvestment,
        uint _raisingAmount,
        uint _hardCap
    )
    {
        wGLBD = _wGLBD;
        investmentToken = _investmentToken;
        startWhitelist = _startWhitelist;
        endWhitelist = _endWhitelist;
        startPublicSale = _startPublicSale;
        endPublicSale = _endPublicSale;
        startVesting = _startVesting;
        endVesting = _endVesting;
        ratioRequiredWGLBDNum = _ratioRequiredWGLBDNum;
        ratioRequiredWGLBDDen = _ratioRequiredWGLBDDen;
        amountForWhitelisted = _amountForWhitelisted;
        minInvestment = _minInvestment;
        maxInvestment = _maxInvestment;
        raisingAmount= _raisingAmount;
        hardCap= _hardCap;
        totalAmountInvested = 0;
        totalAmountInvestedRemaining = 0;
    }

    function setProjectToken(address _projectToken) external onlyOwner
    {
        projectToken = _projectToken;
    }

    function isWhitelist(address _address) public view returns(bool)
    {
        return whitelist[_address];
    }

    function setWhitelist(address _address) external onlyOwner
    {
        whitelist[_address] = !whitelist[_address];
    }

    function setWhitelist(address[] calldata addrs) external onlyOwner
    {
        for (uint i = 0; i < addrs.length; i++)
        {
            whitelist[addrs[i]] = !whitelist[addrs[i]];
        }
    }

    function isBlacklist(address _address) public view returns(bool)
    {
        return blacklist[_address];
    }

    function setBlacklist(address _address) external onlyOwner
    {
        blacklist[_address] = !blacklist[_address];
        if(blacklist[_address])
        {
            removeUser(_address);
        }
    }

    function replaceUser(address _addressOld, address _addressNew) external onlyOwner
    {
        require(userInfo[_addressOld].whitelisted || userInfo[_addressOld].depositWGLBD, 'userOut does not exist');
        require(!userInfo[_addressNew].whitelisted && !userInfo[_addressNew].depositWGLBD, 'userIn already exists');

        //COPY OLD TO NEW
        userInfo[_addressNew].depositedInvestmentTokens = userInfo[_addressOld].depositedInvestmentTokens;
        userInfo[_addressNew].refundedInvestmentTokens = userInfo[_addressOld].refundedInvestmentTokens;
        userInfo[_addressNew].claimableProjectTokens = userInfo[_addressOld].claimableProjectTokens;
        userInfo[_addressNew].depositedWGLBD = userInfo[_addressOld].depositedWGLBD;
        userInfo[_addressNew].remainingWGLBD = userInfo[_addressOld].remainingWGLBD;
        userInfo[_addressNew].depositWGLBD = userInfo[_addressOld].depositWGLBD;
        userInfo[_addressNew].whitelisted = userInfo[_addressOld].whitelisted;

        addressList.push(address(_addressNew));

        //REMOVE OLD
        delete userInfo[_addressOld];
        for (uint8 i = 0; i < addressList.length; i++)
        {
            if (addressList[i] == _addressOld)
            {
                for (uint j = i; j<addressList.length-1; j++)
                {
                    addressList[j] = addressList[j+1];
                }
                addressList.pop();
            }
        }
    }

    function removeUser(address _address) internal
    {
        IBEP20(investmentToken).safeTransfer(address(_address), userInfo[_address].depositedInvestmentTokens);
        IERC20(wGLBD).safeTransfer(address(_address), userInfo[_address].depositedWGLBD);

        totalAmountInvested = totalAmountInvested.sub(userInfo[_address].depositedInvestmentTokens);
        totalAmountInvestedRemaining = totalAmountInvestedRemaining.sub(userInfo[_address].depositedInvestmentTokens);

        for (uint8 i = 0; i < addressList.length; i++)
        {
            if (addressList[i] == _address)
            {
                for (uint j = i; j<addressList.length-1; j++)
                {
                    addressList[j] = addressList[j+1];
                }
                addressList.pop();
            }
        }
        delete userInfo[_address];
    }

    function setTimeWhitelist(uint _startWhitelist, uint _endWhitelist) public onlyOwner
    {
        startWhitelist = _startWhitelist;
        endWhitelist = _endWhitelist;
    }

    function setTimePublicSale(uint _startPublicSale, uint _endPublicSale) public onlyOwner
    {
        startPublicSale = _startPublicSale;
        endPublicSale = _endPublicSale;
    }

    function setTimeVesting(uint _startVesting, uint _endVesting) public onlyOwner
    {
        startVesting = _startVesting;
        endVesting = _endVesting;
    }

    function setAmountForWhitelisted(uint _amountForWhitelisted) public onlyOwner
    {
        amountForWhitelisted = _amountForWhitelisted;
    }

    function setMinInvestment(uint _minInvestment) public onlyOwner
    {
        minInvestment = _minInvestment;
    }

    function setMaxInvestment(uint _maxInvestment) public onlyOwner
    {
        maxInvestment = _maxInvestment;
    }

    function setRaisingAmount(uint _raisingAmount) public onlyOwner
    {
        raisingAmount = _raisingAmount;
    }

    function setHardCap(uint _hardCap) public onlyOwner
    {
        hardCap = _hardCap;
    }

    function setRatioRequiredWGLBD(uint _ratioRequiredWGLBDNum, uint _ratioRequiredWGLBDDen) public onlyOwner
    {
        ratioRequiredWGLBDNum = _ratioRequiredWGLBDNum;
        ratioRequiredWGLBDDen = _ratioRequiredWGLBDDen;
    }

    function requiredWGLBDtoBUSD(uint _amount) public view returns (uint)
    {
        return _amount.mul(ratioRequiredWGLBDNum).div(ratioRequiredWGLBDDen);
    }

    function requiredBUSDtoWGLBD(uint _amount) public view returns (uint)
    {
        return _amount.mul(ratioRequiredWGLBDDen).div(ratioRequiredWGLBDNum);
    }

    function canInvestMin(address _user) public view returns (uint)
    {
        uint amountToInvest = 0;
        if(block.timestamp > startPublicSale && block.timestamp < endPublicSale && !userInfo[_user].depositWGLBD && !whitelist[_user])
        {
            amountToInvest = minInvestment;
        }
        return amountToInvest;
    }

    function canInvestMax(address _user) public view returns (uint)
    {
        uint amountToInvest = 0;

        if (block.timestamp > startWhitelist && block.timestamp < endWhitelist && whitelist[_user] && userInfo[msg.sender].depositedInvestmentTokens < amountForWhitelisted)
        {
            amountToInvest = amountForWhitelisted.sub(userInfo[_user].depositedInvestmentTokens);
        }
        else if(block.timestamp > startPublicSale && block.timestamp < endPublicSale)
        {
            amountToInvest = requiredWGLBDtoBUSD(IERC20(wGLBD).balanceOf(_user));
            amountToInvest = amountToInvest > maxInvestment.sub(userInfo[_user].depositedInvestmentTokens) ? maxInvestment.sub(userInfo[_user].depositedInvestmentTokens) : amountToInvest;
        }

        uint amountRemainingToInvest = hardCap > totalAmountInvested ? hardCap.sub(totalAmountInvested) : 0;
        return amountToInvest < amountRemainingToInvest ? amountToInvest : amountRemainingToInvest;
    }

    function invest(uint _amount) public nonReentrant
    {
        require ((block.timestamp > startWhitelist && block.timestamp < endWhitelist && whitelist[msg.sender]) ||
            (block.timestamp > startPublicSale && block.timestamp < endPublicSale), 'not presale time');
        require (_amount > 0, 'need _amount > 0');
        require (_amount >= canInvestMin(msg.sender), 'you need to invest more');
        require (_amount <= canInvestMax(msg.sender), 'you cannot invest so many tokens'); //
        require (!isBlacklist(msg.sender), 'YOU cannot invest'); //

        if(block.timestamp > startWhitelist && block.timestamp < endWhitelist && whitelist[msg.sender] && userInfo[msg.sender].depositedInvestmentTokens < amountForWhitelisted)
        {
            userInfo[msg.sender].whitelisted = true;
        }
        else if(block.timestamp > startPublicSale && block.timestamp < endPublicSale)
        {
            uint wglbdToDeposit = requiredBUSDtoWGLBD(_amount);
            userInfo[msg.sender].depositWGLBD = true;
            userInfo[msg.sender].depositedWGLBD = userInfo[msg.sender].depositedWGLBD.add(wglbdToDeposit);
            userInfo[msg.sender].remainingWGLBD = userInfo[msg.sender].remainingWGLBD.add(wglbdToDeposit);
            IERC20(wGLBD).safeTransferFrom(address(msg.sender), address(this), wglbdToDeposit);
        }

        IBEP20(investmentToken).safeTransferFrom(address(msg.sender), address(this), _amount);
        if (userInfo[msg.sender].depositedInvestmentTokens == 0)
        {
          addressList.push(address(msg.sender));
        }
        userInfo[msg.sender].depositedInvestmentTokens = userInfo[msg.sender].depositedInvestmentTokens.add(_amount);

        totalAmountInvested = totalAmountInvested.add(_amount);
        totalAmountInvestedRemaining = totalAmountInvestedRemaining.add(_amount);

        emit Invest(msg.sender, _amount);
    }

    // get the amount of investment tokens you will be refunded
    function getExcessInvestmentTokens(address _user) public view returns(uint)
    {
        if (totalAmountInvested <= raisingAmount)
        {
            return 0;
        }
        uint allocation = getUserAllocation(_user);
        uint payAmount = raisingAmount.mul(allocation).div(1e6);
        uint excessInvestment = userInfo[_user].depositedInvestmentTokens.sub(payAmount).sub(userInfo[_user].refundedInvestmentTokens);
        return excessInvestment>DUST?excessInvestment:0;
    }

    function refundExcessInvestmentTokens(address _user) public nonReentrant
    {
        require (block.timestamp > startVesting, 'not refund time');
        uint refundingTokenAmount = getExcessInvestmentTokens(_user);
        if (refundingTokenAmount > 0)
        {
            totalAmountInvestedRemaining = totalAmountInvestedRemaining.sub(refundingTokenAmount);
            IBEP20(investmentToken).safeTransfer(_user, refundingTokenAmount);
            userInfo[_user].refundedInvestmentTokens = userInfo[_user].refundedInvestmentTokens.add(refundingTokenAmount);
        }
    }

    function recoverWGLBD(address _depositor) public nonReentrant
    {
        uint transferAmount = availableToRecoverWGLBD(_depositor);

        IERC20(wGLBD).safeTransfer(_depositor, transferAmount);

        userInfo[_depositor].remainingWGLBD = userInfo[_depositor].remainingWGLBD.sub(transferAmount);
    }

    function availableToInvest(address _depositor) public view returns ( uint )
    {
        return maxInvestment.sub(userInfo[ _depositor ].depositedInvestmentTokens);
    }

    function availableToRecoverWGLBD(address _depositor) public view returns ( uint )
    {
        UserInfo memory user = userInfo[ _depositor ];

        uint harvestingAmount = 0;
        if(startVesting>block.timestamp)
        {
            harvestingAmount = user.remainingWGLBD;
        }
        else if(endVesting>block.timestamp)
        {
            harvestingAmount = user.depositedWGLBD
            .mul(endVesting.sub(block.timestamp))
            .div(endVesting.sub(startVesting));
        }

        return user.remainingWGLBD.sub(harvestingAmount);
    }

    // allocation 100000 means 0.1(10%), 1 meanss 0.000001(0.0001%), 1000000 means 1(100%)
    function getUserAllocation(address _user) public view returns(uint)
    {
        return userInfo[_user].depositedInvestmentTokens.mul(1e12).div(totalAmountInvested).div(1e6);
    }

    // get the amount of IPSO token you will get
    function getOfferingAmount(address _user, uint _amount) public view returns(uint)
    {
        uint allocation = getUserAllocation(_user);
        return _amount.mul(allocation).div(1e6);
    }

    function distributeProjectTokens(uint _amount, uint start, uint end) public onlyOwner
    {

        for (uint i = start; i <= end; i++)
        {
            userInfo[addressList[i]].claimableProjectTokens = userInfo[addressList[i]].claimableProjectTokens.add(getOfferingAmount(addressList[i],_amount));
        }
    }

    function distributeProjectTokens(uint _amount) public onlyOwner
    {
        distributeProjectTokens(_amount,0,addressList.length-1);
    }

    function claimProjectTokens(address _user) public nonReentrant
    {
        uint claimAmount = userInfo[_user].claimableProjectTokens;

        if (claimAmount > 0)
        {
            IBEP20(projectToken).safeTransfer(_user, claimAmount);
            userInfo[_user].claimableProjectTokens = 0;
            emit Claim(msg.sender, claimAmount);
        }
    }

    function getAddressListLength() external view returns(uint)
    {
        return addressList.length;
    }

    function withdrawInvestmentToken(uint _amount) public onlyOwner
    {
        uint amountBlocked = totalAmountInvestedRemaining > raisingAmount ? totalAmountInvestedRemaining.sub(raisingAmount) : 0;
        require (_amount <= IBEP20(investmentToken).balanceOf(address(this)).sub(amountBlocked), 'not enough investment tokens');
        IBEP20(investmentToken).safeTransfer(address(msg.sender), _amount);
    }

    function withdrawInvestmentToken() public onlyOwner
    {
        uint amountBlocked = totalAmountInvestedRemaining > raisingAmount ? totalAmountInvestedRemaining.sub(raisingAmount) : 0;
        IBEP20(investmentToken).safeTransfer(address(msg.sender), IBEP20(investmentToken).balanceOf(address(this)).sub(amountBlocked));
    }

    function withdrawProjectToken(uint _amount) public onlyOwner
    {
        require (_amount <= IBEP20(projectToken).balanceOf(address(this)), 'not enough project token');
        IBEP20(projectToken).safeTransfer(address(msg.sender), _amount);
    }

    function withdrawProjectToken() public onlyOwner
    {
        IBEP20(projectToken).safeTransfer(address(msg.sender), IBEP20(projectToken).balanceOf(address(this)));
    }

    function recoverWrongTokens(address _tokenAddress, uint _tokenAmount) external onlyOwner
    {
        IBEP20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);
    }

    function recoverWrongTokens2(address _tokenAddress, uint _tokenAmount) external onlyOwner
    {
        IERC20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);
    }
}