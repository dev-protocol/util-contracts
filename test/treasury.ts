import { expect, use } from 'chai'
import { Contract } from 'ethers'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import { toBigNumber } from './lib/number'
import Treasury from '../build/Treasury.json'
import MockDev from '../build/MockDev.json'
import MockAddressConfig from '../build/MockAddressConfig.json'
import MockLWithdraw from '../build/MockLWithdraw.json'

use(solidity)

describe('Treasury', () => {
	const provider = new MockProvider()
	const [deployer, user, property] = provider.getWallets()
	let treasury: Contract
	let mockDev: Contract
	let mockAddressConfig: Contract
	let mockWithdraw: Contract

	beforeEach(async () => {
		mockAddressConfig = await deployContract(deployer, MockAddressConfig, [])
		treasury = await deployContract(deployer, Treasury, [
			mockAddressConfig.address,
		])
		mockDev = await deployContract(deployer, MockDev)
		mockWithdraw = await deployContract(deployer, MockLWithdraw, [
			mockAddressConfig.address,
		])
		await mockDev.transfer(mockWithdraw.address, '1000000000000000000000')
		await mockAddressConfig.setWithdraw(mockWithdraw.address)
		await mockAddressConfig.setToken(mockDev.address)
	})
	describe('withdraw, ', () => {
		it('Can hold a DEV token.', async () => {
			const beforeBalance = await mockDev.balanceOf(treasury.address)
			await treasury.withdraw(property.address, {
				gasLimit: 2000000,
			})
			const afterBalance = await mockDev.balanceOf(treasury.address)
			const diffBalance = afterBalance.sub(beforeBalance)
			expect(await diffBalance.toString()).to.be.equal('10000000000000000000')
		})
	})
	describe('transfer, ', () => {
		it('DEV token can be transferred to sender.', async () => {
			await treasury.withdraw(property.address, {
				gasLimit: 2000000,
			})
			const beforeBalance = await mockDev
				.balanceOf(deployer.address)
				.then(toBigNumber)
			await treasury.transfer()
			const afterBalance = await mockDev
				.balanceOf(deployer.address)
				.then(toBigNumber)
			const diffBalance = afterBalance.sub(beforeBalance)
			expect(await diffBalance.toString()).to.be.equal('10000000000000000000')
		})
		it('Can not be performed except by the owner.', async () => {
			const treasuryUser = treasury.connect(user)
			await expect(treasuryUser.transfer()).to.be.revertedWith(
				'Ownable: caller is not the owner'
			)
		})
	})
})
