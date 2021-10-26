// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.4;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// prettier-ignore
import {IWithdraw} from "@devprotocol/protocol-v2/contracts/interface/IWithdraw.sol";
// prettier-ignore
import {IProperty} from "@devprotocol/protocol-v2/contracts/interface/IProperty.sol";
// prettier-ignore
import {IAddressRegistry} from "@devprotocol/protocol-v2/contracts/interface/IAddressRegistry.sol";

contract TreasuryV2 is OwnableUpgradeable {
	IAddressRegistry private registry;

	function initialize(address _registry) external initializer {
		__Ownable_init();
		registry = IAddressRegistry(_registry);
	}

	function withdraw(address _property) external {
		IWithdraw(registry.registries("Withdraw")).withdraw(_property);
	}

	function transferProperty(address _property, address _nextTreasury)
		external
		onlyOwner
		returns (bool)
	{
		IERC20 property = IERC20(_property);
		uint256 balance = property.balanceOf(address(this));
		return property.transfer(_nextTreasury, balance);
	}

	function transferDev() external onlyOwner returns (bool) {
		IERC20 token = IERC20(registry.registries("Dev"));
		uint256 balance = token.balanceOf(address(this));
		return token.transfer(msg.sender, balance);
	}
}
