// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.7.6;

interface IAdmin {
	function addAdmin(address admin) external;

	function deleteAdmin(address admin) external;

	function isAdmin(address account) external view returns (bool);
}
