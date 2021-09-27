// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

import {AddressLib} from "../../utils/AddressLib.sol";
import {Base64} from "../../utils/Base64.sol";

contract LibraryTest {
	using Base64 for bytes;
	using AddressLib for address;

	function base64Encode(string memory data)
		external
		pure
		returns (string memory)
	{
		return bytes(abi.encodePacked(data)).encode();
	}

	function addressToChecksumString(address account)
		external
		pure
		returns (string memory asciiString)
	{
		return account.toChecksumString();
	}
}
