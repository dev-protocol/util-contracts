// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.7.6;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {UsingStorage} from "./../storage/UsingStorage.sol";

contract Config is UsingStorage, Ownable {
	function set(string memory _key, address _value) external onlyOwner {
		eternalStorage().setAddress(getAddressKey(_key), _value);
	}

	function get(string memory _key) external view returns (address) {
		return eternalStorage().getAddress(getAddressKey(_key));
	}

	function setByteKey(bytes32 _key, address _value) external onlyOwner {
		eternalStorage().setAddress(_key, _value);
	}

	function getByteKey(bytes32 _key) external view returns (address) {
		return eternalStorage().getAddress(_key);
	}

	function getAddressKey(string memory _key) private pure returns (bytes32) {
		return keccak256(abi.encodePacked("_address", _key));
	}
}
