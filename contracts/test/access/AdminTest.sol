// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

import {AccessAdmin} from "contracts/access/AccessAdmin.sol";

/**
 * Module for contrast handling EternalStorage.
 */
contract AdminTest is AccessAdmin {
	uint256 private constant _VALUE = 1;

	function getValueOnlyAdmin() external view onlyAdmin returns (uint256) {
		return _VALUE;
	}
}
