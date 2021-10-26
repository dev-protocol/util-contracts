import { expect, use } from 'chai'
import { Signer } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { toBigNumber } from './lib/number'
import {
	TreasuryV2,
	TreasuryV2__factory,
	MockAddressRegistry,
	MockAddressRegistry__factory,
	MockDev,
	MockDev__factory,
	MockWithdrawV2,
	MockWithdrawV2__factory,
	MockProperty,
	MockProperty__factory,
} from '../typechain'

use(solidity)

describe('TreasuryV2', () => {
	let deployer: Signer
	let user: Signer
	let property: Signer
	let treasury: TreasuryV2
	let mockDev: MockDev
	let mockAddressRegistry: MockAddressRegistry
	let mockWithdraw: MockWithdrawV2
	let mockProperty: MockProperty

	beforeEach(async () => {
		;[deployer, user, property] = await ethers.getSigners()

		const mockAddressRegistryFactory = (await ethers.getContractFactory(
			'MockAddressRegistry'
		)) as MockAddressRegistry__factory
		mockAddressRegistry = await mockAddressRegistryFactory.deploy()

		const treasuryFactory = (await ethers.getContractFactory(
			'TreasuryV2'
		)) as TreasuryV2__factory
		treasury = await treasuryFactory.deploy()
		await treasury.initialize(mockAddressRegistry.address)

		const mockDevFactory = (await ethers.getContractFactory(
			'MockDev'
		)) as MockDev__factory
		mockDev = await mockDevFactory.deploy()

		const mockWithdrawFactory = (await ethers.getContractFactory(
			'MockWithdrawV2'
		)) as MockWithdrawV2__factory
		mockWithdraw = await mockWithdrawFactory.deploy(mockAddressRegistry.address)

		const mockPropertyFactory = (await ethers.getContractFactory(
			'MockProperty'
		)) as MockProperty__factory
		mockProperty = await mockPropertyFactory.deploy()

		await mockDev.transfer(mockWithdraw.address, '1000000000000000000000')
		await mockAddressRegistry.setRegistry('Withdraw', mockWithdraw.address)
		await mockAddressRegistry.setRegistry('Dev', mockDev.address)
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
			expect(diffBalance.toString()).to.be.equal('10000000000000000000')
		})
	})

	describe('transferProperty, ', () => {
		it('DEV token can be transferred to sender.', async () => {
			const firstBalance = await mockProperty.balanceOf(treasury.address)
			expect(firstBalance.toString()).to.be.equal('0')

			await mockProperty.mint(treasury.address, '10000000000000000000')

			const secondBalance = await mockProperty.balanceOf(treasury.address)
			expect(secondBalance.toString()).to.be.equal('10000000000000000000')

			const nextTreasuryFactory = (await ethers.getContractFactory(
				'TreasuryV2'
			)) as TreasuryV2__factory
			const nextTreasury: TreasuryV2 = await nextTreasuryFactory.deploy()
			await nextTreasury.initialize(mockAddressRegistry.address)

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
			const nextTreasuryFactory = (await ethers.getContractFactory(
				'TreasuryV2'
			)) as TreasuryV2__factory
			const nextTreasury: TreasuryV2 = await nextTreasuryFactory.deploy()
			await nextTreasury.initialize(mockAddressRegistry.address)

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
			expect(diffBalance.toString()).to.be.equal('10000000000000000000')
		})

		it('Can not be performed except by the owner.', async () => {
			await expect(treasury.connect(user).transferDev()).to.be.revertedWith(
				'Ownable: caller is not the owner'
			)
		})
	})
})
