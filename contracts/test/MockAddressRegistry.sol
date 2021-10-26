// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IAddressRegistry} from "@devprotocol/protocol-v2/contracts/interface/IAddressRegistry.sol";

import "hardhat/console.sol";

contract MockAddressRegistry is OwnableUpgradeable, IAddressRegistry {
	mapping(string => address) private reg;

	function setRegistry(string calldata _key, address _addr)
		external
		override
	{
		reg[_key] = _addr;
	}

	function registries(string calldata _key)
		external
		view
		override
		returns (address)
	{
		return reg[_key];
	}
}
