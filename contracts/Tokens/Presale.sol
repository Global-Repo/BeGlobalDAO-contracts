// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "../Modifiers/Ownable.sol";
import "../Modifiers/Trusted.sol";
import "../Libraries/SafeMath.sol";
import "../Tokens/IBEP20.sol";
import "../Libraries/SafeBEP20.sol";
import "./BEP20.sol";

contract Presale is Trusted{

    using SafeBEP20 for uint16;
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    BEP20 public busdToken;
    uint public presaleBegins;
    uint public presaleEnds;

    uint public hardcap = 400e18;
    uint public busdAcc = 0;

    mapping (address => uint) private quantityBought;
    address[] private buyers;

    event TokensBought(address buyer, uint256 amount, uint256 busdAcc);
    event AdminTokenRecovery(address tokenRecovered, uint256 amount);

    constructor(address _token, uint _presaleBegins, uint _presaleEnds) public {
        busdToken = BEP20(_token);

        presaleBegins = _presaleBegins;
        presaleEnds = _presaleEnds;
    }

    function changePresalePeriod(uint _presaleBegins, uint _presaleEnds) public onlyOwner {
        presaleBegins = _presaleBegins;
        presaleEnds = _presaleEnds;
    }

    function getStatus() public view returns (bool) {
        return presaleBegins < block.timestamp && block.timestamp < presaleEnds;
    }

    function buyTokens(uint256 amount, address buyer) public onlyHuman {
        require(presaleBegins < block.timestamp && block.timestamp < presaleEnds && whitelist[buyer], "[ERROR: YOU ARE NOT ALLOWED TO BUY]");
        require(quantityBought[buyer].add(amount) <= hardcap, '[ERROR: THANK YOU FOR YOUR KIND SUPPORT, BUT YOU CAN NOT BUY SO MANY TOKENS. Wait for launch to purchase more]');

        busdToken.transferFrom(buyer, address(this), amount);
        if(quantityBought[buyer]==0)
        {
            buyers.push(buyer);
        }
        quantityBought[buyer] = quantityBought[buyer].add(amount);
        busdAcc = busdAcc.add(amount);
        emit TokensBought(buyer, amount, busdAcc);
    }

    function transferBUSDsAcc(uint _amount) external onlyOwner {
        payable(address(msg.sender)).transfer(_amount);
        emit AdminTokenRecovery(address(busdToken), _amount);
    }

    function recoverWrongTokens(address _tokenAddress, uint256 _tokenAmount) external onlyOwner {
        IBEP20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);
        emit AdminTokenRecovery(_tokenAddress, _tokenAmount);
    }

    function getQuantityBought(address buyer) external view returns(uint) {
        return quantityBought[buyer];
    }

    function getBuyer(uint position) external view returns(address) {
        return buyers[position];
    }

    function getBuyers() external view returns(address[] memory) {
        return buyers;
    }

    function getQuantities() external view returns(uint[] memory) {
        uint[] memory quantities = new uint[](buyers.length);
        for(uint i=0;i<buyers.length;i++)
        {
            quantities[i]=quantityBought[buyers[i]];
        }
        return quantities;
    }
}
