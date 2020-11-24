// SPDX-License-Identifier: MPL-2.0

pragma solidity 0.6.12;

import {Admin} from "contracts/access/Admin.sol";
import {EternalStorage} from "contracts/storage/EternalStorage.sol";

/**
 * Module for contrast handling EternalStorage.
 */
contract UsingStorage is Admin {
	address private _storage;
	bytes32 public constant STORAGE_OWNER_ROLE =
		keccak256("STORAGE_OWNER_ROLE");

	constructor() public {
		_setRoleAdmin(STORAGE_OWNER_ROLE, DEFAULT_ADMIN_ROLE);
		grantRole(STORAGE_OWNER_ROLE, _msgSender());
	}

	modifier onlyStoargeOwner() {
		require(isStorageOwner(_msgSender()), "storage owner only.");
		_;
	}

	function isStorageOwner(address account) public view returns (bool) {
		return hasRole(STORAGE_OWNER_ROLE, account);
	}

	function addStorageOwner(address _storageOwner) external onlyAdmin {
		grantRole(STORAGE_OWNER_ROLE, _storageOwner);
	}

	function deleteStorageOwner(address _storageOwner) external onlyAdmin {
		revokeRole(STORAGE_OWNER_ROLE, _storageOwner);
	}

	/**
	 * Modifier to verify that EternalStorage is set.
	 */
	modifier hasStorage() {
		require(_storage != address(0), "storage is not set");
		_;
	}

	/**
	 * Returns the set EternalStorage instance.
	 */
	function eternalStorage()
		internal
		view
		hasStorage
		returns (EternalStorage)
	{
		return EternalStorage(_storage);
	}

	/**
	 * Returns the set EternalStorage address.
	 */
	function getStorageAddress() external view hasStorage returns (address) {
		return _storage;
	}

	/**
	 * Create a new EternalStorage contract.
	 * This function call will fail if the EternalStorage contract is already set.
	 * Also, only the storage owner can execute it.
	 */
	function createStorage() external onlyStoargeOwner {
		require(_storage == address(0), "storage is set");
		EternalStorage tmp = new EternalStorage();
		_storage = address(tmp);
	}

	/**
	 * Assigns the EternalStorage contract that has already been created.
	 * Only the storage owner can execute this function.
	 */
	function setStorage(address _storageAddress) external onlyStoargeOwner {
		_storage = _storageAddress;
	}

	/**
	 * Delegates the owner of the current EternalStorage contract.
	 * Only the storage owner can execute this function.
	 */
	function changeOwner(address newOwner) external onlyStoargeOwner {
		EternalStorage(_storage).changeOwner(newOwner);
	}
}
