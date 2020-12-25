import { expect, use } from 'chai'
import { constants } from 'ethers'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import Config from '../../build/Config.json'

use(solidity)

describe('Config', () => {
	const provider = new MockProvider()
	const [deployer, test] = provider.getWallets()
	describe('Config: set, get', () => {
		it('we can retrieve the address you set.', async () => {
			const config = await deployContract(deployer, Config)
			await config.createStorage()
			await config.set('test', test.address)
			const result = await config.get('test')
			expect(result).to.be.equal(test.address)
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
