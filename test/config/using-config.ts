import { expect, use } from 'chai'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import Config from '../../build/Config.json'
import UsingConfigTest from '../../build/UsingConfigTest.json'

use(solidity)

describe('UsingConfig', () => {
	const provider = new MockProvider()
	const [deployer] = provider.getWallets()

	describe('UsingConfig: configAddress', () => {
		it('we can get the address of the config.', async () => {
			const config = await deployContract(deployer, Config)
			const usingConfig = await deployContract(deployer, UsingConfigTest, [
				config.address,
			])
			const configAddress = await usingConfig.configAddress()
			expect(configAddress).to.be.equal(config.address)
		})
	})
	describe('UsingConfig: config', () => {
		it('we can get the address of the config.', async () => {
			const config = await deployContract(deployer, Config)
			const usingConfig = await deployContract(deployer, UsingConfigTest, [
				config.address,
			])
			const configAddress = await usingConfig.configTest()
			expect(configAddress).to.be.equal(config.address)
		})
	})
})
