import { expect, use } from 'chai'
import { constants } from 'ethers'
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
			await config.get('test')
			const result = await config.get('test')
			expect(result).to.be.equal(constants.AddressZero)
		})
	})
})
