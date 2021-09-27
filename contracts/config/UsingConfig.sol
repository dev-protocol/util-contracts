// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

import {IConfig} from "./IConfig.sol";

/**
 * Module for using AddressConfig contracts.
 */
contract UsingConfig {
	address private _config;

	/**
	 * Initialize the argument as AddressConfig address.
	 */
	constructor(address _addressConfig) {
		_config = _addressConfig;
	}

	/**
	 * Returns the latest AddressConfig instance.
	 */
	function config() internal view returns (IConfig) {
		return IConfig(_config);
	}

	/**
	 * Returns the latest AddressConfig address.
	 */
	function configAddress() public view returns (address) {
		return _config;
	}
}
