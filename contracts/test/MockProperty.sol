// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.6.12;

// prettier-ignore
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockProperty is ERC20("name", "NAME"){
    function mint(address account, uint256 amount) external {
		_mint(account, amount);
    }
}

