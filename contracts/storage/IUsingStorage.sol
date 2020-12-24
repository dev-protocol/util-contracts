// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.7.6;

interface IUsingStorage {
	// function addAdmin(address admin) external;
	// function deleteAdmin(address admin) external;
	// function isAdmin(address account) external view returns (bool);
	function isStorageOwner(address account) external view returns (bool);

	function addStorageOwner(address _storageOwner) external;

	function deleteStorageOwner(address _storageOwner) external;

	function getStorageAddress() external view returns (address);

	function createStorage() external;

	function setStorage(address _storageAddress) external;

	function changeOwner(address newOwner) external;
}
