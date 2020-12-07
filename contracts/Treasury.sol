// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.6.12;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IWithdraw} from "@devprtcl/protocol/contracts/interface/IWithdraw.sol";
import {IAddressConfig} from "@devprtcl/protocol/contracts/interface/IAddressConfig.sol";

contract Treasury is Ownable {
	IAddressConfig private config;

	constructor(address _config) public {
		config = IAddressConfig(_config);
	}

	function withdraw(address _property) external {
		IWithdraw(config.withdraw()).withdraw(_property);
	}

	function transfer() external onlyOwner returns (bool) {
		IERC20 token = IERC20(config.token());
		uint256 balance = token.balanceOf(address(this));
		return token.transfer(msg.sender, balance);
	}
}
