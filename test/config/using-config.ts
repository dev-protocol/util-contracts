import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { Config, UsingConfigTest } from '../../typechain-types'

use(solidity)

describe('UsingConfig', () => {
	let config: Config
	let usingConfig: UsingConfigTest

	beforeEach(async () => {
		const configFactory = await ethers.getContractFactory('Config')
		config = await configFactory.deploy()

		const usingConfigFactory = await ethers.getContractFactory(
			'UsingConfigTest'
		)
		usingConfig = await usingConfigFactory.deploy(config.address)
	})

	describe('UsingConfig: configAddress', () => {
		it('we can get the address of the config.', async () => {
			const configAddress = await usingConfig.configAddress()
			expect(configAddress).to.be.equal(config.address)
		})
	})

	describe('UsingConfig: config', () => {
		it('we can get the address of the config.', async () => {
			const configAddress = await usingConfig.configTest()
			expect(configAddress).to.be.equal(config.address)
		})
	})
})
