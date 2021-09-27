// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

interface IUsingStorageSimple {
	function getStorageAddress() external view returns (address);

	function createStorage() external;

	function setStorage(address _storageAddress) external;

	function changeOwner(address newOwner) external;
}
