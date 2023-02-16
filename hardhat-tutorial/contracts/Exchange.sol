// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public onigiriTokenAddress;

    // Exchange is inheriting ERC20, because our exchange would keep track of Onigiri LP tokens
    constructor(address _Onigiritoken) ERC20("Onigiri LP Token", "ONILP") {
        require(
            _Onigiritoken != address(0),
            "Token address passed is a null address"
        );
        onigiriTokenAddress = _Onigiritoken;
    }

    function getReserve() public view returns (uint) {
        return ERC20(onigiriTokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable returns (uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint onigiriTokenReserve = getReserve();
        ERC20 onigiriToken = ERC20(onigiriTokenAddress);

        if (onigiriTokenReserve == 0) {
            onigiriToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        } else {
            uint ethReserve = ethBalance - msg.value;
            uint onigiriTokenAmount = (msg.value * onigiriTokenReserve) /
                (ethReserve);
            require(
                _amount >= onigiriTokenAmount,
                "Amount of tokens is less than the minimum tokens required"
            );

            onigiriToken.transferFrom(
                msg.sender,
                address(this),
                onigiriTokenAmount
            );
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }

        return liquidity;
    }

    function removeLiquidity(uint _amount) public returns (uint, uint) {
        require(_amount > 0, "_amount should be greater than 0");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();

        uint ethAmount = (ethReserve * _amount) / _totalSupply;
        uint onigiriTokenAmount = (getReserve() * _amount) / _totalSupply;

        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        ERC20(onigiriTokenAddress).transfer(msg.sender, onigiriTokenAmount);
        return (ethAmount, onigiriTokenAmount);
    }

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        uint256 inputAmountWithFee = inputAmount * 99;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function ethToOnigiriToken(uint _minTokens) public payable {
        uint256 tokenReserve = getReserve();
        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );

        require(tokensBought >= _minTokens, "insufficient output amount");
        ERC20(onigiriTokenAddress).transfer(msg.sender, tokensBought);
    }

    function onigiriTokenToEth(uint _tokensSold, uint _minEth) public {
        uint256 tokensReserve = getReserve();
        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokensReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "insufficient output amount");

        ERC20(onigiriTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );
        payable(msg.sender).transfer(ethBought);
    }
}
