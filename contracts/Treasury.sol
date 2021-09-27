// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// prettier-ignore
import {IWithdraw} from "@devprotocol/protocol/contracts/interface/IWithdraw.sol";
// prettier-ignore
import {IProperty} from "@devprotocol/protocol/contracts/interface/IProperty.sol";
// prettier-ignore
import {IAddressConfig} from "@devprotocol/protocol/contracts/interface/IAddressConfig.sol";

contract Treasury is Ownable {
	IAddressConfig private config;

	constructor(address _config) {
		config = IAddressConfig(_config);
	}

	function withdraw(address _property) external {
		IWithdraw(config.withdraw()).withdraw(_property);
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
		IERC20 token = IERC20(config.token());
		uint256 balance = token.balanceOf(address(this));
		return token.transfer(msg.sender, balance);
	}
}
