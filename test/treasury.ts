import { expect, use } from 'chai'
import { Contract, Signer } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { toBigNumber } from './lib/number'

use(solidity)

describe('Treasury', () => {
	let deployer: Signer
	let user: Signer
	let property: Signer
	let treasury: Contract
	let mockDev: Contract
	let mockAddressConfig: Contract
	let mockWithdraw: Contract
	let mockProperty: Contract

	beforeEach(async () => {
		;[deployer, user, property] = await ethers.getSigners()

		const mockAddressConfigFactory = await ethers.getContractFactory(
			'MockAddressConfig'
		)
		mockAddressConfig = await mockAddressConfigFactory.deploy()

		const treasuryFactory = await ethers.getContractFactory('Treasury')
		treasury = await treasuryFactory.deploy(mockAddressConfig.address)

		const mockDevFactory = await ethers.getContractFactory('MockDev')
		mockDev = await mockDevFactory.deploy()

		const mockWithdrawFactory = await ethers.getContractFactory('MockWithdraw')
		mockWithdraw = await mockWithdrawFactory.deploy(mockAddressConfig.address)

		const mockPropertyFactory = await ethers.getContractFactory('MockProperty')
		mockProperty = await mockPropertyFactory.deploy()

		await mockDev.transfer(mockWithdraw.address, '1000000000000000000000')
		await mockAddressConfig.setWithdraw(mockWithdraw.address)
		await mockAddressConfig.setToken(mockDev.address)
	})

	describe('withdraw, ', () => {
		it('Can hold a DEV token.', async () => {
			const beforeBalance = await mockDev.balanceOf(treasury.address)
			const propertyAddress = await property.getAddress()
			await treasury.withdraw(propertyAddress, {
				gasLimit: 2000000,
			})
			const afterBalance = await mockDev.balanceOf(treasury.address)
			const diffBalance = afterBalance.sub(beforeBalance)
			expect(await diffBalance.toString()).to.be.equal('10000000000000000000')
		})
	})

	describe('transferProperty, ', () => {
		it('DEV token can be transferred to sender.', async () => {
			const firstBalance = await mockProperty.balanceOf(treasury.address)
			expect(firstBalance.toString()).to.be.equal('0')

			await mockProperty.mint(treasury.address, '10000000000000000000')

			const secondBalance = await mockProperty.balanceOf(treasury.address)
			expect(secondBalance.toString()).to.be.equal('10000000000000000000')

			const nextTreasuryFactory = await ethers.getContractFactory('Treasury')
			const nextTreasury = await nextTreasuryFactory.deploy(
				mockAddressConfig.address
			)

			const deployerAddress = await deployer.getAddress()

			const beforeBalance = await mockProperty.balanceOf(deployerAddress)
			expect(beforeBalance.toString()).to.be.equal('0')

			await treasury.transferProperty(
				mockProperty.address,
				nextTreasury.address
			)

			const thirdBalance = await mockProperty.balanceOf(treasury.address)
			expect(thirdBalance.toString()).to.be.equal('0')
			const afterBalance = await mockProperty.balanceOf(nextTreasury.address)
			expect(afterBalance.toString()).to.be.equal('10000000000000000000')
		})

		it('Can not be performed except by the owner.', async () => {
			const nextTreasuryFactory = await ethers.getContractFactory('Treasury')
			const nextTreasury = await nextTreasuryFactory.deploy(
				mockAddressConfig.address
			)

			await expect(
				treasury
					.connect(user)
					.transferProperty(mockProperty.address, nextTreasury.address)
			).to.be.revertedWith('Ownable: caller is not the owner')
		})
	})

	describe('transferDev, ', () => {
		it('DEV token can be transferred to sender.', async () => {
			const deployerAddress = await deployer.getAddress()
			const propertyAddress = await property.getAddress()

			await treasury.withdraw(propertyAddress, { gasLimit: 2000000 })
			const beforeBalance = await mockDev
				.balanceOf(deployerAddress)
				.then(toBigNumber)

			await treasury.transferDev()

			const afterBalance = await mockDev
				.balanceOf(deployerAddress)
				.then(toBigNumber)

			const diffBalance = afterBalance.sub(beforeBalance)
			expect(await diffBalance.toString()).to.be.equal('10000000000000000000')
		})

		it('Can not be performed except by the owner.', async () => {
			await expect(treasury.connect(user).transferDev()).to.be.revertedWith(
				'Ownable: caller is not the owner'
			)
		})
	})
})
