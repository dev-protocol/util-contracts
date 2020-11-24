// SPDX-License-Identifier: MPL-2.0

pragma solidity 0.6.12;

import {Admin} from "contracts/access/Admin.sol";

/**
 * Module for contrast handling EternalStorage.
 */
contract AdminTest is Admin {
	uint256 private constant _VALUE = 1;

	function getValueOnlyAdmin() external view onlyAdmin returns (uint256) {
		return _VALUE;
	}
}
