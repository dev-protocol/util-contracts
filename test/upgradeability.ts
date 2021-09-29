import { expect, use } from 'chai'
import { Contract, Signer, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import {
	TreasuryAdmin,
	TreasuryAdmin__factory,
	TreasuryL2,
	TreasuryL2__factory,
	TreasuryProxy,
	TreasuryProxy__factory,
} from '../typechain'

use(solidity)

describe('Treasury Upgradeability', () => {
	let other: Signer

	let treasuryV1: TreasuryL2
	let admin: TreasuryAdmin
	let proxy: TreasuryProxy
	let proxified: Contract

	beforeEach(async () => {
		;[, other] = await ethers.getSigners()

		const treasuryFactory = (await ethers.getContractFactory(
			'TreasuryL2'
		)) as TreasuryL2__factory
		treasuryV1 = await treasuryFactory.deploy()

		const adminFactory = (await ethers.getContractFactory(
			'TreasuryAdmin'
		)) as TreasuryAdmin__factory
		admin = await adminFactory.deploy()

		const proxyFactory = (await ethers.getContractFactory(
			'TreasuryProxy'
		)) as TreasuryProxy__factory
		proxy = await proxyFactory.deploy(
			treasuryV1.address,
			admin.address,
			utils.toUtf8Bytes('')
		)

		proxified = treasuryV1.attach(proxy.address)
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
