// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.0;

// The real AddressConfig contract does not inherit the interface, so the test mock will do so as well.
contract MockAddressConfig {
	address public token;
	address public withdraw;

	function setToken(address _token) external {
		token = _token;
	}

	function setWithdraw(address _withdraw) external {
		withdraw = _withdraw;
	}
}
