// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.0;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IAdmin} from "./IAdmin.sol";

abstract contract Admin is AccessControl, IAdmin {
	constructor() {
		_setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
	}

	modifier onlyAdmin() {
		require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "admin only.");
		_;
	}

	function addAdmin(address admin) external virtual override onlyAdmin {
		grantRole(DEFAULT_ADMIN_ROLE, admin);
	}

	function deleteAdmin(address admin) external virtual override onlyAdmin {
		revokeRole(DEFAULT_ADMIN_ROLE, admin);
	}

	function isAdmin(address account) external view override returns (bool) {
		return hasRole(DEFAULT_ADMIN_ROLE, account);
	}
}
