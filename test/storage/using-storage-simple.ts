import { expect, use } from 'chai'
import { Signer, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { UsingStorageSimpleTest } from '../../typechain-types'

use(solidity)

describe('UsingStorageSimple', () => {
	let user: Signer
	let usingStorageSimple: UsingStorageSimpleTest

	beforeEach(async () => {
		;[, user] = await ethers.getSigners()

		const usingStorageSimpleFact = await ethers.getContractFactory(
			'UsingStorageSimpleTest'
		)
		usingStorageSimple = await usingStorageSimpleFact.deploy()
	})

	describe('UsingStorageSimple: eternalStorage', () => {
		it('returns EternalStorage instance.', async () => {
			await usingStorageSimple.createStorage({
				gasLimit: 2000000,
			})
			const result = await usingStorageSimple.getEternalStorageAddress()
			const expected = await usingStorageSimple.getStorageAddress()

			expect(result).to.be.equal(expected)
		})
	})

	describe('UsingStorageSimple; hasStorage, createStorage', () => {
		describe('success', () => {
			it('if storage has been created, the storage address can be obtained.', async () => {
				await usingStorageSimple.createStorage()
				const result = await usingStorageSimple.getStorageAddress()

				expect(utils.isAddress(result)).to.be.equal(true)
			})

			it('if the storage has been created, you can access the storage.', async () => {
				await usingStorageSimple.createStorage()
				const result = await usingStorageSimple.getUInt()

				expect(result.toNumber()).to.be.equal(0)
			})
		})

		describe('fail', () => {
			it('failure if you donot have owner privileges.', async () => {
				await expect(
					usingStorageSimple.connect(user).createStorage()
				).to.be.revertedWith('Ownable: caller is not the owner')
			})

			it('if storage has not been created, an error will occur when trying to get the storage address.', async () => {
				await expect(usingStorageSimple.getStorageAddress()).to.be.revertedWith(
					'storage is not set'
				)
			})

			it('if storage has not been created, an error will occur when accessing storage.', async () => {
				await expect(usingStorageSimple.getUInt()).to.be.revertedWith(
					'storage is not set'
				)
			})

			it('creating storage again after storage has been created results in an error.', async () => {
				await usingStorageSimple.createStorage()

				await expect(usingStorageSimple.createStorage()).to.be.revertedWith(
					'storage is set'
				)
			})
		})
	})

	describe('UsingStorageSimple; getStorageAddress, setStorage, changeOwner', () => {
		let usingStorageSimpleNext: UsingStorageSimpleTest

		beforeEach(async () => {
			const usingStorageSimpleNextFact = await ethers.getContractFactory(
				'UsingStorageSimpleTest'
			)
			usingStorageSimpleNext = await usingStorageSimpleNextFact.deploy()

			await usingStorageSimple.createStorage()
			await usingStorageSimple.setUInt(1)
		})

		describe('success', () => {
			it('can get the value set in the storage.', async () => {
				const result = await usingStorageSimple.getUInt()

				expect(result.toNumber()).to.be.equal(1)
			})

			it('the storage address is taken over, the same storage can be accessed from the takeover destination.', async () => {
				const storageAddress = await usingStorageSimple.getStorageAddress()
				await usingStorageSimpleNext.setStorage(storageAddress)
				const result = await usingStorageSimpleNext.getUInt()

				expect(result.toNumber()).to.be.equal(1)
			})

			it('when delegating authority, the delegate can write to storage', async () => {
				const storageAddress = await usingStorageSimple.getStorageAddress()
				await usingStorageSimpleNext.setStorage(storageAddress)
				await usingStorageSimple.changeOwner(usingStorageSimpleNext.address)
				await usingStorageSimpleNext.setUInt(2)
				const result = await usingStorageSimpleNext.getUInt()

				expect(result.toNumber()).to.be.equal(2)
			})
		})

		describe('fail', () => {
			it('failure if you donot have storage owner privileges.(setStorage)', async () => {
				const storageAddress = await usingStorageSimple.getStorageAddress()
				await expect(
					usingStorageSimple.connect(user).setStorage(storageAddress)
				).to.be.revertedWith('Ownable: caller is not the owner')
			})

			it('failure if you donot have storage owner privileges.(changeOwner)', async () => {
				await expect(
					usingStorageSimple
						.connect(user)
						.changeOwner(usingStorageSimple.address)
				).to.be.revertedWith('Ownable: caller is not the owner')
			})

			it('Before delegating authority, you can not write.', async () => {
				const storageAddress = await usingStorageSimple.getStorageAddress()
				await usingStorageSimpleNext.setStorage(storageAddress)
				await expect(usingStorageSimpleNext.setUInt(2)).to.be.revertedWith(
					'not current owner'
				)
			})

			it('Delegation of authority is not possible from the delegate.', async () => {
				const storageAddress = await usingStorageSimple.getStorageAddress()
				await usingStorageSimpleNext.setStorage(storageAddress)
				await expect(
					usingStorageSimpleNext.changeOwner(usingStorageSimpleNext.address)
				).to.be.revertedWith('not current owner')
			})

			it('When delegating authority, delegation source can not write to storage.', async () => {
				const storageAddress = await usingStorageSimple.getStorageAddress()
				await usingStorageSimpleNext.setStorage(storageAddress)
				await usingStorageSimple.changeOwner(usingStorageSimpleNext.address)
				await expect(usingStorageSimple.setUInt(2)).to.be.revertedWith(
					'not current owner'
				)
			})
		})
	})
})
