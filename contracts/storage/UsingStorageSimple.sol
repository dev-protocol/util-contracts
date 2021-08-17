// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EternalStorage} from "./EternalStorage.sol";
import {IUsingStorageSimple} from "./IUsingStorageSimple.sol";

/**
 * Module for contrast handling EternalStorage.
 */
contract UsingStorageSimple is Ownable, IUsingStorageSimple {
	address private _storage;

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
	function createStorage() external override onlyOwner {
		require(_storage == address(0), "storage is set");
		EternalStorage tmp = new EternalStorage();
		_storage = address(tmp);
	}

	/**
	 * Assigns the EternalStorage contract that has already been created.
	 * Only the storage owner can execute this function.
	 */
	function setStorage(address _storageAddress) external override onlyOwner {
		_storage = _storageAddress;
	}

	/**
	 * Delegates the owner of the current EternalStorage contract.
	 * Only the storage owner can execute this function.
	 */
	function changeOwner(address newOwner) external override onlyOwner {
		EternalStorage(_storage).changeOwner(newOwner);
	}
}
