// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.4;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// prettier-ignore
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ConvertOnTransfer is ERC20Burnable, Ownable {
	using SafeMath for uint256;
	IERC20 private dev;
	bool public convertible;

	constructor(address _dev, bool _convertible)
		ERC20("ConvertOnTransfer", "COT")
	{
		dev = IERC20(_dev);
		convertible = _convertible;
	}

	function setConvertible(bool _flag) public onlyOwner {
		convertible = _flag;
	}

	function deposit(uint256 _value) public {
		require(
			dev.transferFrom(msg.sender, address(this), _value),
			"failed deposit"
		);
		_mint(msg.sender, _value);
	}

	function transfer(address _to, uint256 _value)
		public
		override
		returns (bool)
	{
		return _implTransfer(msg.sender, _to, _value);
	}

	function transferFrom(
		address _from,
		address _to,
		uint256 _value
	) public override returns (bool) {
		_approve(
			_from,
			_msgSender(),
			allowance(_from, _msgSender()).sub(
				_value,
				"ERC20: transfer amount exceeds allowance"
			)
		);
		return _implTransfer(_from, _to, _value);
	}

	function _implTransfer(
		address _from,
		address _to,
		uint256 _value
	) private returns (bool) {
		if (convertible) {
			_burn(_from, _value);
			return dev.transfer(_to, _value);
		}
		_transfer(_from, _to, _value);
		return true;
	}

	function rescue(
		address _token,
		address _to,
		uint256 _value
	) public onlyOwner {
		IERC20(_token).transfer(_to, _value);
	}
}
