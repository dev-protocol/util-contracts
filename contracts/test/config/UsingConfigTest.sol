// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.7.6;

import {UsingConfig} from "contracts/config/UsingConfig.sol";
import {IConfig} from "contracts/config/IConfig.sol";

contract UsingConfigTest is UsingConfig {
	constructor(address _addressConfig) UsingConfig(_addressConfig) {}

	function configTest() external view returns (IConfig) {
		return config();
	}
}
