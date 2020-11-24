// SPDX-License-Identifier: MPL-2.0

pragma solidity 0.6.12;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

abstract contract Admin is AccessControl {
	constructor() public {
		_setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
	}

	modifier onlyAdmin() {
		require(isAdmin(_msgSender()), "admin only.");
		_;
	}

	function addAdmin(address admin) external virtual onlyAdmin {
		grantRole(DEFAULT_ADMIN_ROLE, admin);
	}

	function deleteAdmin(address admin) external virtual onlyAdmin {
		revokeRole(DEFAULT_ADMIN_ROLE, admin);
	}

	function isAdmin(address account) public view returns (bool) {
		return hasRole(DEFAULT_ADMIN_ROLE, account);
	}
}
