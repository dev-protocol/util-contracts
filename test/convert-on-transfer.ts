import { expect, use } from 'chai'
import { Signer } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { toBigNumber } from './lib/number'
import {
	MockDev,
	MockDev__factory,
	ConvertOnTransfer,
	ConvertOnTransfer__factory,
} from '../typechain'

use(solidity)

describe('ConvertOnTransfer', () => {
	let deployer: Signer
	let user: Signer
	let user2: Signer
	let mockDev: MockDev
	let convertOnTransfer: ConvertOnTransfer
	let convertOnTransferUser: ConvertOnTransfer

	beforeEach(async () => {
		;[deployer, user, user2] = await ethers.getSigners()

		const mockDevFactory = (await ethers.getContractFactory(
			'MockDev'
		)) as MockDev__factory
		mockDev = await mockDevFactory.deploy()

		const convertOnTransferFactory = (await ethers.getContractFactory(
			'ConvertOnTransfer'
		)) as ConvertOnTransfer__factory
		convertOnTransfer = await convertOnTransferFactory.deploy(
			mockDev.address,
			true
		)

		convertOnTransferUser = convertOnTransfer.connect(user)
	})

	describe('constructor,', () => {
		it('set property.', async () => {
			expect(await convertOnTransfer.convertible()).to.be.equal(true)
			expect(await convertOnTransfer.name()).to.be.equal('ConvertOnTransfer')
			expect(await convertOnTransfer.symbol()).to.be.equal('COT')
			expect(await convertOnTransfer.decimals()).to.be.equal(18)
		})
	})

	describe('setConvertible,', () => {
		it('The flags set by the owner will be reflected.', async () => {
			await convertOnTransfer.setConvertible(false)
			expect(await convertOnTransfer.convertible()).to.be.equal(false)
		})

		it('Only the owner can set the flag.', async () => {
			await expect(
				convertOnTransferUser.setConvertible(false)
			).to.be.revertedWith('Ownable: caller is not the owner')
		})
	})

	describe('deposit,', () => {
		it('Converter tokens will be issued for the number of dev tokens you deposit.', async () => {
			const value = toBigNumber('10000000000000000000000')
			const deployerAddress = await deployer.getAddress()

			await mockDev.approve(convertOnTransfer.address, value)
			const beforeDeployerDevBalance = await mockDev
				.balanceOf(deployerAddress)
				.then(toBigNumber)
			const beforeConverterDevBalance = await mockDev
				.balanceOf(convertOnTransfer.address)
				.then(toBigNumber)
			const beforeConverterTotalSupply = await convertOnTransfer
				.totalSupply()
				.then(toBigNumber)
			const beforeDeployerBalance = await convertOnTransfer
				.balanceOf(deployerAddress)
				.then(toBigNumber)

			await convertOnTransfer.deposit(value)

			const afterDeployerDevBalance = await mockDev
				.balanceOf(deployerAddress)
				.then(toBigNumber)
			const afterConverterDevBalance = await mockDev
				.balanceOf(convertOnTransfer.address)
				.then(toBigNumber)
			const afterConverterTotalSupply = await convertOnTransfer
				.totalSupply()
				.then(toBigNumber)
			const afterDeployerBalance = await convertOnTransfer
				.balanceOf(deployerAddress)
				.then(toBigNumber)

			expect(
				beforeDeployerDevBalance.sub(value).eq(afterDeployerDevBalance)
			).to.be.equal(true)

			expect(
				beforeConverterDevBalance.add(value).eq(afterConverterDevBalance)
			).to.be.equal(true)

			expect(
				beforeConverterTotalSupply.add(value).eq(afterConverterTotalSupply)
			).to.be.equal(true)

			expect(
				beforeDeployerBalance.add(value).eq(afterDeployerBalance)
			).to.be.equal(true)
		})
	})

	describe('rescue,', () => {
		it('Retrieve the token you are holding.', async () => {
			const value = toBigNumber('10000000000000000000000')
			const userAddress = await user.getAddress()
			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)

			let currentDevBalance = await mockDev
				.balanceOf(convertOnTransfer.address)
				.then(toBigNumber)

			expect(currentDevBalance.eq(value)).to.be.equal(true)

			const beforeUserDevBalance = await mockDev
				.balanceOf(userAddress)
				.then(toBigNumber)

			await convertOnTransfer.rescue(mockDev.address, userAddress, value)

			currentDevBalance = await mockDev
				.balanceOf(convertOnTransfer.address)
				.then(toBigNumber)

			expect(currentDevBalance.toString()).to.be.equal('0')

			const afterUserDevBalance = await mockDev
				.balanceOf(userAddress)
				.then(toBigNumber)

			expect(
				beforeUserDevBalance.add(value).eq(afterUserDevBalance)
			).to.be.equal(true)
		})

		it('Only the owner can execute rescue func.', async () => {
			const value = toBigNumber('10000000000000000000000')
			const userAddress = await user.getAddress()

			await expect(
				convertOnTransferUser.rescue(mockDev.address, userAddress, value)
			).to.be.revertedWith('Ownable: caller is not the owner')
		})
	})

	describe('transfer,', () => {
		it('convertible.', async () => {
			const value = toBigNumber('10000000000000000000000')
			const user2Address = await user2.getAddress()
			const deployerAddress = await deployer.getAddress()
			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)

			expect(
				(await mockDev.balanceOf(user2Address).then(toBigNumber)).toString()
			).to.be.equal('0')

			expect(
				(
					await mockDev.balanceOf(convertOnTransfer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())

			expect(
				(
					await convertOnTransfer.balanceOf(deployerAddress).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())

			// 100 COT
			const value2 = toBigNumber('100000000000000000000')
			await convertOnTransfer.transfer(user2Address, value2, {
				gasLimit: 2000000,
			})

			expect(
				(await mockDev.balanceOf(user2Address).then(toBigNumber)).toString()
			).to.be.equal(value2.toString())
			expect(
				(
					await mockDev.balanceOf(convertOnTransfer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
			expect(
				(
					await convertOnTransfer.balanceOf(deployerAddress).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
		})

		it('non convertible.', async () => {
			const value = toBigNumber('10000000000000000000000')
			const deployerAddress = await deployer.getAddress()
			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)
			await convertOnTransfer.setConvertible(false)

			expect(
				(
					await convertOnTransfer.balanceOf(deployerAddress).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())

			// 100 COT
			const value2 = toBigNumber('100000000000000000000')
			const user2Address = await user2.getAddress()
			await convertOnTransfer.transfer(user2Address, value2, {
				gasLimit: 2000000,
			})

			expect(
				(
					await convertOnTransfer.balanceOf(deployerAddress).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
		})
	})

	describe('transferFrom,', () => {
		it('convertible.', async () => {
			// 10000 DEV
			const value = toBigNumber('10000000000000000000000')
			const deployerAddress = await deployer.getAddress()
			const userAddress = await user.getAddress()
			const user2Address = await user2.getAddress()

			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)

			// 100 COT
			const value2 = toBigNumber('100000000000000000000')

			expect(
				(
					await convertOnTransfer.balanceOf(deployerAddress).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())

			expect(
				(
					await mockDev.balanceOf(convertOnTransfer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())

			expect(
				(await mockDev.balanceOf(user2Address).then(toBigNumber)).toString()
			).to.be.equal('0')

			await convertOnTransfer.approve(userAddress, value2)
			await convertOnTransferUser.transferFrom(
				deployerAddress,
				user2Address,
				value2
			)

			expect(
				(
					await convertOnTransfer.balanceOf(deployerAddress).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())

			expect(
				(
					await mockDev.balanceOf(convertOnTransfer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())

			expect(
				(await mockDev.balanceOf(user2Address).then(toBigNumber)).toString()
			).to.be.equal(value2.toString())
		})

		it('non convertible.', async () => {
			// 10000 DEV
			const value = toBigNumber('10000000000000000000000')
			const deployerAddress = await deployer.getAddress()
			const userAddress = await user.getAddress()
			const user2Address = await user2.getAddress()

			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)
			await convertOnTransfer.setConvertible(false)

			expect(
				(
					await convertOnTransfer.balanceOf(deployerAddress).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())

			// 100 COT
			const value2 = toBigNumber('100000000000000000000')
			await convertOnTransfer.approve(userAddress, value2)
			await convertOnTransferUser.transferFrom(
				deployerAddress,
				user2Address,
				value2,
				{
					gasLimit: 2000000,
				}
			)

			expect(
				(
					await convertOnTransfer.balanceOf(deployerAddress).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
		})
	})
})
