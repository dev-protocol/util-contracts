// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

import {UsingStorage} from "./../storage/UsingStorage.sol";

contract Config is UsingStorage {
	function set(string memory _key, address _value) internal onlyAdmin {
		eternalStorage().setAddress(getAddressKey(_key), _value);
	}

	function get(string memory _key) internal view returns (address) {
		return eternalStorage().getAddress(getAddressKey(_key));
	}

	function setByteKey(bytes32 _key, address _value) internal onlyAdmin {
		eternalStorage().setAddress(_key, _value);
	}

	function getByteKey(bytes32 _key) internal view returns (address) {
		return eternalStorage().getAddress(_key);
	}

	function getAddressKey(string memory _key) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_address", _key));
	}
}
