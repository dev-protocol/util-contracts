import { expect, use } from 'chai'
import { Contract, Signer, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import {
	AdminL2,
	AdminL2__factory,
	TreasuryL2,
	TreasuryL2__factory,
	UpgradeableProxy,
	UpgradeableProxy__factory,
} from '../typechain'

use(solidity)

describe('Treasury Upgradeability', () => {
	let other: Signer

	let treasuryV1: TreasuryL2
	let admin: AdminL2
	let upgradeableProxy: UpgradeableProxy
	let proxified: Contract

	beforeEach(async () => {
		;[, other] = await ethers.getSigners()

		const treasuryFactory = (await ethers.getContractFactory(
			'TreasuryL2'
		)) as TreasuryL2__factory
		treasuryV1 = await treasuryFactory.deploy()

		const adminFactory = (await ethers.getContractFactory(
			'AdminL2'
		)) as AdminL2__factory
		admin = await adminFactory.deploy()

		const upgradeableProxyFactory = (await ethers.getContractFactory(
			'UpgradeableProxy'
		)) as UpgradeableProxy__factory
		upgradeableProxy = await upgradeableProxyFactory.deploy(
			treasuryV1.address,
			admin.address,
			utils.toUtf8Bytes('')
		)

		proxified = treasuryV1.attach(upgradeableProxy.address)
	})

	describe('Initialize', () => {
		it('proxyImplementation', async () => {
			const treasuryV1Address = await admin.getProxyImplementation(
				proxified.address
			)
			expect(treasuryV1Address).to.be.equal(treasuryV1.address)
		})
	})

	describe('Upgrade', async () => {
		let treasuryV2: TreasuryL2

		beforeEach(async () => {
			const treasuryV2Factory = (await ethers.getContractFactory(
				'TreasuryL2'
			)) as TreasuryL2__factory
			treasuryV2 = await treasuryV2Factory.deploy()
		})

		describe('Success', () => {
			it('store new proxyImplementation', async () => {
				const proxyImplementation = await admin.getProxyImplementation(
					proxified.address
				)
				expect(proxyImplementation).to.be.equal(treasuryV1.address)

				await admin.upgrade(proxified.address, treasuryV2.address)

				const proxyImplementationV2 = await admin.getProxyImplementation(
					proxified.address
				)
				expect(proxyImplementationV2).to.be.equal(treasuryV2.address)
			})
		})

		describe('Fail', () => {
			it('revert if msg.sender is not admin', async () => {
				/* eslint-disable @typescript-eslint/no-floating-promises */
				expect(
					admin.connect(other).upgrade(proxified.address, treasuryV2.address)
				).to.be.revertedWith('Ownable: caller is not the owner')
			})
		})
	})
})
