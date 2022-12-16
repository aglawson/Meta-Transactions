// SPDX-License-Identifier: No License
pragma solidity ^0.8.17;

import "./ERC20.sol";

contract Token is ERC20("TestUSDC", "TUSDC") {
    constructor() {
        _mint(_msgSender(), 1000000000000000000000000);
    }

    function mint(uint256 amount) external {
        _mint(_msgSender(), amount);
    }

}