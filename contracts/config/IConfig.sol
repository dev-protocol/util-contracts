// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

interface IConfig {
	function set(string memory _key, address _value) external;

	function get(string memory _key) external view returns (address);
}
