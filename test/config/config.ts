import { expect, use } from 'chai'
import { constants, Signer, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { ConfigTest, ConfigTest__factory } from '../../typechain'

use(solidity)

describe('Config', () => {
	let test: Signer
	let user: Signer
	let config: ConfigTest

	beforeEach(async () => {
		;[, test, user] = await ethers.getSigners()

		const configFactory = (await ethers.getContractFactory(
			'ConfigTest'
		)) as ConfigTest__factory
		config = await configFactory.deploy()
		await config.createStorage()
	})

	describe('Config: set, get', () => {
		it('we can retrieve the address you set.', async () => {
			const testAddress = await test.getAddress()
			await config.setTest('test', testAddress)
			const result = await config.getTest('test')

			expect(result).to.be.equal(testAddress)
		})

		it('we can retrieve the address you set.', async () => {
			const testAddress = await test.getAddress()

			await expect(
				config.connect(user).setTest('test', testAddress)
			).to.be.revertedWith('admin only.')
		})

		it('initial value is 0.', async () => {
			const result = await config.getTest('test')

			expect(result).to.be.equal(constants.AddressZero)
		})
	})

	describe('Config: setByteKey, getByteKey', () => {
		const key = utils.keccak256(utils.toUtf8Bytes('test_key'))

		it('we can retrieve the address you set.', async () => {
			const testAddress = await test.getAddress()
			await config.setByteKeyTest(key, testAddress)
			const result = await config.getByteKeyTest(key)

			expect(result).to.be.equal(testAddress)
		})

		it('If someone other than the owner sets it, an error will occur.', async () => {
			const testAddress = await test.getAddress()

			await expect(
				config.connect(user).setByteKeyTest(key, testAddress)
			).to.be.revertedWith('admin only.')
		})

		it('initial value is 0.', async () => {
			const result = await config.getTest(key)

			expect(result).to.be.equal(constants.AddressZero)
		})
	})
})
