// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.6.12;

// prettier-ignore
import {IAddressConfig} from "@devprtcl/protocol/contracts/interface/IAddressConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockLWithdraw {
	IAddressConfig private config;

	constructor(address _config) public {
		config = IAddressConfig(_config);
	}

	function withdraw(address) external {
		IERC20(config.token()).transfer(msg.sender, 10000000000000000000);
	}
}
