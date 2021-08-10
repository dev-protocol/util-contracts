import {expect, use} from 'chai'
import {Contract} from 'ethers'
import {deployContract, MockProvider, solidity} from 'ethereum-waffle'
import {toBigNumber} from './lib/number'
import ConvertOnTransfer from '../build/ConvertOnTransfer.json'
import MockDev from '../build/MockDev.json'

use(solidity)

describe('ConvertOnTransfer', () => {
	const provider = new MockProvider()
	const [deployer, user, user2] = provider.getWallets()

	const init = async (): Promise<[Contract, Contract, Contract]> => {
		const mockDev = await deployContract(deployer, MockDev)
		const convertOnTransfer = await deployContract(
			deployer,
			ConvertOnTransfer,
			[mockDev.address, true]
		)
		const convertOnTransferUser = convertOnTransfer.connect(user)
		return [convertOnTransfer, convertOnTransferUser, mockDev]
	}

	describe('constructor,', () => {
		it('set property.', async () => {
			const [convertOnTransfer] = await init()
			expect(await convertOnTransfer.convertible()).to.be.equal(true)
			expect(await convertOnTransfer.name()).to.be.equal('ConvertOnTransfer')
			expect(await convertOnTransfer.symbol()).to.be.equal('COT')
			expect(await convertOnTransfer.decimals()).to.be.equal(18)
		})
	})
	describe('setConvertible,', () => {
		it('The flags set by the owner will be reflected.', async () => {
			const [convertOnTransfer] = await init()
			await convertOnTransfer.setConvertible(false)
			expect(await convertOnTransfer.convertible()).to.be.equal(false)
		})
		it('Only the owner can set the flag.', async () => {
			const [, convertOnTransfer] = await init()
			await expect(convertOnTransfer.setConvertible(false)).to.be.revertedWith(
				'Ownable: caller is not the owner'
			)
		})
	})
	describe('deposit,', () => {
		it('Converter tokens will be issued for the number of dev tokens you deposit.', async () => {
			const [convertOnTransfer, , mockDev] = await init()
			// 10000 DEV
			const value = toBigNumber('10000000000000000000000')
			await mockDev.approve(convertOnTransfer.address, value)
			const beforeDeployerDevBalance = await mockDev
				.balanceOf(deployer.address)
				.then(toBigNumber)
			const beforeConverterDevBalance = await mockDev
				.balanceOf(convertOnTransfer.address)
				.then(toBigNumber)
			const beforeConverterTotalSupply = await convertOnTransfer
				.totalSupply()
				.then(toBigNumber)
			const beforeDeployerBalance = await convertOnTransfer
				.balanceOf(deployer.address)
				.then(toBigNumber)

			await convertOnTransfer.deposit(value)

			const afterDeployerDevBalance = await mockDev
				.balanceOf(deployer.address)
				.then(toBigNumber)
			const afterConverterDevBalance = await mockDev
				.balanceOf(convertOnTransfer.address)
				.then(toBigNumber)
			const afterConverterTotalSupply = await convertOnTransfer
				.totalSupply()
				.then(toBigNumber)
			const afterDeployerBalance = await convertOnTransfer
				.balanceOf(deployer.address)
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
			const [convertOnTransfer, , mockDev] = await init()
			// 10000 DEV
			const value = toBigNumber('10000000000000000000000')
			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)
			let currentDevBalance = await mockDev
				.balanceOf(convertOnTransfer.address)
				.then(toBigNumber)
			expect(currentDevBalance.eq(value)).to.be.equal(true)
			const beforeUserDevBalance = await mockDev
				.balanceOf(user.address)
				.then(toBigNumber)
			await convertOnTransfer.rescue(mockDev.address, user.address, value)
			currentDevBalance = await mockDev
				.balanceOf(convertOnTransfer.address)
				.then(toBigNumber)
			expect(currentDevBalance.toString()).to.be.equal('0')
			const afterUserDevBalance = await mockDev
				.balanceOf(user.address)
				.then(toBigNumber)
			expect(
				beforeUserDevBalance.add(value).eq(afterUserDevBalance)
			).to.be.equal(true)
		})
		it('Only the owner can execute rescue func.', async () => {
			const [, convertOnTransfer, mockDev] = await init()
			// 10000 DEV
			const value = toBigNumber('10000000000000000000000')
			await expect(
				convertOnTransfer.rescue(mockDev.address, user.address, value)
			).to.be.revertedWith('Ownable: caller is not the owner')
		})
	})
	describe('transfer,', () => {
		it('convertible.', async () => {
			const [convertOnTransfer, , mockDev] = await init()
			// 10000 DEV
			const value = toBigNumber('10000000000000000000000')
			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)

			expect(
				(await mockDev.balanceOf(user2.address).then(toBigNumber)).toString()
			).to.be.equal('0')
			expect(
				(
					await mockDev.balanceOf(convertOnTransfer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())
			expect(
				(
					await convertOnTransfer.balanceOf(deployer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())

			// 100 COT
			const value2 = toBigNumber('100000000000000000000')
			await convertOnTransfer.transfer(user2.address, value2, {
				gasLimit: 2000000,
			})
			expect(
				(await mockDev.balanceOf(user2.address).then(toBigNumber)).toString()
			).to.be.equal(value2.toString())
			expect(
				(
					await mockDev.balanceOf(convertOnTransfer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
			expect(
				(
					await convertOnTransfer.balanceOf(deployer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
		})
		it('non convertible.', async () => {
			const [convertOnTransfer, , mockDev] = await init()
			// 10000 DEV
			const value = toBigNumber('10000000000000000000000')
			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)
			await convertOnTransfer.setConvertible(false)

			expect(
				(
					await convertOnTransfer.balanceOf(deployer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())

			// 100 COT
			const value2 = toBigNumber('100000000000000000000')
			await convertOnTransfer.transfer(user2.address, value2, {
				gasLimit: 2000000,
			})
			expect(
				(
					await convertOnTransfer.balanceOf(deployer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
		})
	})

	describe('transferFrom,', () => {
		it('convertible.', async () => {
			const [convertOnTransfer, convertOnTransferUser, mockDev] = await init()
			// 10000 DEV
			const value = toBigNumber('10000000000000000000000')
			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)

			// 100 COT
			const value2 = toBigNumber('100000000000000000000')
			expect(
				(
					await convertOnTransfer.balanceOf(deployer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())
			expect(
				(
					await mockDev.balanceOf(convertOnTransfer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())
			expect(
				(await mockDev.balanceOf(user2.address).then(toBigNumber)).toString()
			).to.be.equal('0')
			await convertOnTransfer.approve(user.address, value2)
			await convertOnTransferUser.transferFrom(
				deployer.address,
				user2.address,
				value2
			)
			expect(
				(
					await convertOnTransfer.balanceOf(deployer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
			expect(
				(
					await mockDev.balanceOf(convertOnTransfer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
			expect(
				(await mockDev.balanceOf(user2.address).then(toBigNumber)).toString()
			).to.be.equal(value2.toString())
		})
		it('non convertible.', async () => {
			const [convertOnTransfer, convertOnTransferUser, mockDev] = await init()
			// 10000 DEV
			const value = toBigNumber('10000000000000000000000')
			await mockDev.approve(convertOnTransfer.address, value)
			await convertOnTransfer.deposit(value)
			await convertOnTransfer.setConvertible(false)

			expect(
				(
					await convertOnTransfer.balanceOf(deployer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.toString())

			// 100 COT
			const value2 = toBigNumber('100000000000000000000')
			await convertOnTransfer.approve(user.address, value2)
			await convertOnTransferUser.transferFrom(
				deployer.address,
				user2.address,
				value2,
				{
					gasLimit: 2000000,
				}
			)
			expect(
				(
					await convertOnTransfer.balanceOf(deployer.address).then(toBigNumber)
				).toString()
			).to.be.equal(value.sub(value2).toString())
		})
	})
})
