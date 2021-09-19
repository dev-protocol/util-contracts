// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IAddressRegistry} from "@devprotocol/protocol-l2/contracts/interface/IAddressRegistry.sol";

import "hardhat/console.sol";

contract MockAddressRegistry is OwnableUpgradeable, IAddressRegistry {
	mapping(string => address) private reg;

	// function initialize() external initializer {
	// 	__Ownable_init();
	// }

	function setRegistry(string calldata _key, address _addr)
		external
		override
	{
		// address sender;
		// console.log(owner());
		// if (
		// 	keccak256(abi.encodePacked(_key)) ==
		// 	keccak256(abi.encodePacked("Policy"))
		// ) {
		// 	sender = reg["PolicyFactory"];
		// } else {
		// 	sender = owner();
		// }
		// require(msg.sender == sender, "this is illegal address");
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
