import { expect, use } from 'chai'
import { constants, utils } from 'ethers'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import Config from '../../build/Config.json'

use(solidity)

describe('Config', () => {
	const provider = new MockProvider()
	const [deployer, test, user] = provider.getWallets()
	describe('Config: set, get', () => {
		it('we can retrieve the address you set.', async () => {
			const config = await deployContract(deployer, Config)
			await config.createStorage()
			await config.set('test', test.address)
			const result = await config.get('test')
			expect(result).to.be.equal(test.address)
		})
		it('If someone other than the owner sets it, an error will occur.', async () => {
			const config = await deployContract(deployer, Config)
			await config.createStorage()
			const userConfig = config.connect(user)
			await expect(userConfig.set('test', test.address)).to.be.revertedWith(
				'Ownable: caller is not the owner'
			)
		})
		it('initial value is 0.', async () => {
			const config = await deployContract(deployer, Config)
			await config.createStorage()
			const result = await config.get('test')
			expect(result).to.be.equal(constants.AddressZero)
		})
	})
	describe('Config: setByteKey, getByteKey', () => {
		const key = utils.keccak256(utils.toUtf8Bytes('test_key'))
		it('we can retrieve the address you set.', async () => {
			const config = await deployContract(deployer, Config)
			await config.createStorage()
			await config.setByteKey(key, test.address)
			const result = await config.getByteKey(key)
			expect(result).to.be.equal(test.address)
		})
		it('If someone other than the owner sets it, an error will occur.', async () => {
			const config = await deployContract(deployer, Config)
			await config.createStorage()
			const userConfig = config.connect(user)
			await expect(userConfig.setByteKey(key, test.address)).to.be.revertedWith(
				'Ownable: caller is not the owner'
			)
		})
		it('initial value is 0.', async () => {
			const config = await deployContract(deployer, Config)
			await config.createStorage()
			const result = await config.get(key)
			expect(result).to.be.equal(constants.AddressZero)
		})
	})
})
