// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.0;

import {Admin} from "../access/Admin.sol";
import {EternalStorage} from "./EternalStorage.sol";
import {IUsingStorage} from "./IUsingStorage.sol";

/**
 * Module for contrast handling EternalStorage.
 */
contract UsingStorage is Admin, IUsingStorage {
	address private _storage;
	bytes32 public constant STORAGE_OWNER_ROLE =
		keccak256("STORAGE_OWNER_ROLE");

	constructor() {
		_setRoleAdmin(STORAGE_OWNER_ROLE, DEFAULT_ADMIN_ROLE);
		grantRole(STORAGE_OWNER_ROLE, _msgSender());
	}

	modifier onlyStoargeOwner() {
		require(
			hasRole(STORAGE_OWNER_ROLE, _msgSender()),
			"storage owner only."
		);
		_;
	}

	function isStorageOwner(address account)
		external
		view
		override
		returns (bool)
	{
		return hasRole(STORAGE_OWNER_ROLE, account);
	}

	function addStorageOwner(address _storageOwner)
		external
		override
		onlyAdmin
	{
		grantRole(STORAGE_OWNER_ROLE, _storageOwner);
	}

	function deleteStorageOwner(address _storageOwner)
		external
		override
		onlyAdmin
	{
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
	function getStorageAddress()
		external
		view
		override
		hasStorage
		returns (address)
	{
		return _storage;
	}

	/**
	 * Create a new EternalStorage contract.
	 * This function call will fail if the EternalStorage contract is already set.
	 * Also, only the storage owner can execute it.
	 */
	function createStorage() external override onlyStoargeOwner {
		require(_storage == address(0), "storage is set");
		EternalStorage tmp = new EternalStorage();
		_storage = address(tmp);
	}

	/**
	 * Assigns the EternalStorage contract that has already been created.
	 * Only the storage owner can execute this function.
	 */
	function setStorage(address _storageAddress)
		external
		override
		onlyStoargeOwner
	{
		_storage = _storageAddress;
	}

	/**
	 * Delegates the owner of the current EternalStorage contract.
	 * Only the storage owner can execute this function.
	 */
	function changeOwner(address newOwner) external override onlyStoargeOwner {
		EternalStorage(_storage).changeOwner(newOwner);
	}
}
