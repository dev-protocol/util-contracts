// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.7.6;

import {UsingStorage} from "./../storage/UsingStorage.sol";

contract Config is UsingStorage {
	function set(string memory _key, address _value) external {
		eternalStorage().setAddress(getAddressKey(_key), _value);
	}

	function get(string memory _key) external view returns(address){
		return eternalStorage().getAddress(getAddressKey(_key));
	}

	function getAddressKey(string memory _key)
		private
		pure
		returns (bytes32)
	{
		return keccak256(abi.encodePacked("_address", _key));
	}
}
