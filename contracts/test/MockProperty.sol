// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockProperty is ERC20("name", "NAME") {
	function mint(address account, uint256 amount) external {
		_mint(account, amount);
	}
}
