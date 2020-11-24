// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.6.12;

import {UsingStorage} from "contracts/storage/UsingStorage.sol";

contract UsingStorageTest is UsingStorage {
	function getEternalStorageAddress() public view returns (address) {
		return address(eternalStorage());
	}

	function setUInt(uint256 _value) external {
		eternalStorage().setUint(getUintKey(), _value);
	}

	function getUInt() external view returns (uint256) {
		return eternalStorage().getUint(getUintKey());
	}

	function getUintKey() private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_uint"));
	}
}
