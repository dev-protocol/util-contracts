// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IAddressRegistry} from "@devprotocol/protocol-l2/contracts/interface/IAddressRegistry.sol";

contract MockWithdraw {
	IAddressRegistry private registry;

	constructor(address _registry) {
		registry = IAddressRegistry(_registry);
	}

	function withdraw(address) external {
		IERC20(registry.registries("Dev")).transfer(
			msg.sender,
			10000000000000000000
		);
	}
}
