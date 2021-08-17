import { expect, use } from 'chai'
import { Contract, utils } from 'ethers'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import UsingStorageSimpleTest from '../../build/UsingStorageSimpleTest.json'

use(solidity)

describe('UsingStorageSimple', () => {
	const provider = new MockProvider()
	const [deployer, user] = provider.getWallets()

	describe('UsingStorageSimple: eternalStorage', () => {
		it('returns EternalStorage instance.', async () => {
			const usingStorageSimple = await deployContract(
				deployer,
				UsingStorageSimpleTest
			)
			await usingStorageSimple.createStorage({
				gasLimit: 2000000,
			})
			const result = await usingStorageSimple.getEternalStorageAddress()
			const expected = await usingStorageSimple.getStorageAddress()
			expect(result).to.be.equal(expected)
		})
	})
	describe('UsingStorageSimple; hasStorage, createStorage', () => {
		let usingStorageSimple: Contract
		beforeEach(async () => {
			usingStorageSimple = await deployContract(
				deployer,
				UsingStorageSimpleTest
			)
		})
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
				const usingStorageNoAuthority = usingStorageSimple.connect(user)
				await expect(
					usingStorageNoAuthority.createStorage()
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
		let usingStorageSimple: Contract
		let usingStorageSimpleNext: Contract
		beforeEach(async () => {
			usingStorageSimple = await deployContract(
				deployer,
				UsingStorageSimpleTest
			)
			await usingStorageSimple.createStorage()
			await usingStorageSimple.setUInt(1)
			usingStorageSimpleNext = await deployContract(
				deployer,
				UsingStorageSimpleTest
			)
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
				const usingStorageNoAuthority = usingStorageSimple.connect(user)
				await expect(
					usingStorageNoAuthority.setStorage(storageAddress)
				).to.be.revertedWith('Ownable: caller is not the owner')
			})
			it('failure if you donot have storage owner privileges.(changeOwner)', async () => {
				const usingStorageNoAuthority = usingStorageSimple.connect(user)
				await expect(
					usingStorageNoAuthority.changeOwner(usingStorageSimple.address)
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
