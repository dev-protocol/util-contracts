// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.7.6;

import {Config} from "./../../config/Config.sol";

contract ConfigTest is Config {
	function setTest(string memory _key, address _value) external {
		set(_key, _value);
	}

	function getTest(string memory _key) external view returns (address) {
		return get(_key);
	}

	function setByteKeyTest(bytes32 _key, address _value) external {
		setByteKey(_key, _value);
	}

	function getByteKeyTest(bytes32 _key) external view returns (address) {
		return getByteKey(_key);
	}
}
