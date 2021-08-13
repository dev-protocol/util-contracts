import { expect, use } from 'chai'
import { Contract, utils } from 'ethers'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import UsingStorageTest from '../../build/UsingStorageTest.json'

use(solidity)

describe('UsingStorage', () => {
	const provider = new MockProvider()
	const [deployer, newAdmin, user] = provider.getWallets()

	describe('UsingStorage: addStorageOwner, deleteStorageOwner', () => {
		describe('success', () => {
			const checkAdminAndStorageOwnerAuthority = async (
				// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
				us: Contract,
				target: string,
				checkAdminValue: boolean,
				checkStorageOwnerValue: boolean
			): Promise<void> => {
				let result = await us.isAdmin(target)
				expect(result).to.be.equal(checkAdminValue)
				result = await us.isStorageOwner(target)
				expect(result).to.be.equal(checkStorageOwnerValue)
			}

			it('can grant storage administrator privileges.', async () => {
				const us = await deployContract(deployer, UsingStorageTest)
				await checkAdminAndStorageOwnerAuthority(
					us,
					newAdmin.address,
					false,
					false
				)
				await us.addStorageOwner(newAdmin.address)
				await checkAdminAndStorageOwnerAuthority(
					us,
					newAdmin.address,
					false,
					true
				)
			})
			it('can remove storage administrator privileges.', async () => {
				const us = await deployContract(deployer, UsingStorageTest)
				await checkAdminAndStorageOwnerAuthority(
					us,
					deployer.address,
					true,
					true
				)
				await us.deleteStorageOwner(deployer.address)
				await checkAdminAndStorageOwnerAuthority(
					us,
					deployer.address,
					true,
					false
				)
			})
		})
		describe('fail', () => {
			it('no one but admin can be executed (addAdmin).', async () => {
				const us = await deployContract(deployer, UsingStorageTest)
				const usOther = us.connect(newAdmin)
				await expect(
					usOther.addStorageOwner(newAdmin.address)
				).to.be.revertedWith('admin only.')
			})
			it('no one but admin can be executed (deleteAdmin).', async () => {
				const us = await deployContract(deployer, UsingStorageTest)
				const usOther = us.connect(newAdmin)
				await expect(
					usOther.deleteStorageOwner(newAdmin.address)
				).to.be.revertedWith('admin only.')
			})
		})
	})

	describe('UsingStorage: eternalStorage', () => {
		it('returns EternalStorage instance.', async () => {
			const us = await deployContract(deployer, UsingStorageTest)
			await us.createStorage({
				gasLimit: 2000000,
			})
			const result = await us.getEternalStorageAddress()
			const expected = await us.getStorageAddress()
			expect(result).to.be.equal(expected)
		})
	})
	describe('UsingStorage; hasStorage, createStorage', () => {
		let usingStorage: Contract
		beforeEach(async () => {
			usingStorage = await deployContract(deployer, UsingStorageTest)
		})
		describe('success', () => {
			it('if storage has been created, the storage address can be obtained.', async () => {
				await usingStorage.createStorage()
				const result = await usingStorage.getStorageAddress()
				expect(utils.isAddress(result)).to.be.equal(true)
			})
			it('if the storage has been created, you can access the storage.', async () => {
				await usingStorage.createStorage()
				const result = await usingStorage.getUInt()
				expect(result.toNumber()).to.be.equal(0)
			})
		})
		describe('fail', () => {
			it('failure if you donot have storage owner privileges.', async () => {
				const usingStorageNoAuthority = usingStorage.connect(user)
				const authority = await usingStorage.isStorageOwner(user.address)
				expect(authority).to.be.equal(false)
				await expect(
					usingStorageNoAuthority.createStorage()
				).to.be.revertedWith('storage owner only.')
			})
			it('if storage has not been created, an error will occur when trying to get the storage address.', async () => {
				await expect(usingStorage.getStorageAddress()).to.be.revertedWith(
					'storage is not set'
				)
			})
			it('if storage has not been created, an error will occur when accessing storage.', async () => {
				await expect(usingStorage.getUInt()).to.be.revertedWith(
					'storage is not set'
				)
			})

			it('creating storage again after storage has been created results in an error.', async () => {
				await usingStorage.createStorage()
				await expect(usingStorage.createStorage()).to.be.revertedWith(
					'storage is set'
				)
			})
		})
	})
	describe('UsingStorage; getStorageAddress, setStorage, changeOwner', () => {
		let usingStorage: Contract
		let usingStorageNext: Contract
		beforeEach(async () => {
			usingStorage = await deployContract(deployer, UsingStorageTest)
			await usingStorage.createStorage()
			await usingStorage.setUInt(1)
			usingStorageNext = await deployContract(deployer, UsingStorageTest)
		})

		describe('success', () => {
			it('can get the value set in the storage.', async () => {
				const result = await usingStorage.getUInt()
				expect(result.toNumber()).to.be.equal(1)
			})
			it('the storage address is taken over, the same storage can be accessed from the takeover destination.', async () => {
				const storageAddress = await usingStorage.getStorageAddress()
				await usingStorageNext.setStorage(storageAddress)
				const result = await usingStorageNext.getUInt()
				expect(result.toNumber()).to.be.equal(1)
			})
			it('when delegating authority, the delegate can write to storage', async () => {
				const storageAddress = await usingStorage.getStorageAddress()
				await usingStorageNext.setStorage(storageAddress)
				await usingStorage.changeOwner(usingStorageNext.address)
				await usingStorageNext.setUInt(2)
				const result = await usingStorageNext.getUInt()
				expect(result.toNumber()).to.be.equal(2)
			})
		})
		describe('fail', () => {
			it('failure if you donot have storage owner privileges.(setStorage)', async () => {
				const storageAddress = await usingStorage.getStorageAddress()
				const usingStorageNoAuthority = usingStorage.connect(user)
				const authority = await usingStorage.isStorageOwner(user.address)
				expect(authority).to.be.equal(false)
				await expect(
					usingStorageNoAuthority.setStorage(storageAddress)
				).to.be.revertedWith('storage owner only.')
			})
			it('failure if you donot have storage owner privileges.(changeOwner)', async () => {
				const usingStorageNoAuthority = usingStorage.connect(user)
				const authority = await usingStorage.isStorageOwner(user.address)
				expect(authority).to.be.equal(false)
				await expect(
					usingStorageNoAuthority.changeOwner(usingStorage.address)
				).to.be.revertedWith('storage owner only.')
			})
			it('Before delegating authority, you can not write.', async () => {
				const storageAddress = await usingStorage.getStorageAddress()
				await usingStorageNext.setStorage(storageAddress)
				await expect(usingStorageNext.setUInt(2)).to.be.revertedWith(
					'not current owner'
				)
			})
			it('Delegation of authority is not possible from the delegate.', async () => {
				const storageAddress = await usingStorage.getStorageAddress()
				await usingStorageNext.setStorage(storageAddress)
				await expect(
					usingStorageNext.changeOwner(usingStorageNext.address)
				).to.be.revertedWith('not current owner')
			})

			it('When delegating authority, delegation source can not write to storage.', async () => {
				const storageAddress = await usingStorage.getStorageAddress()
				await usingStorageNext.setStorage(storageAddress)
				await usingStorage.changeOwner(usingStorageNext.address)
				await expect(usingStorage.setUInt(2)).to.be.revertedWith(
					'not current owner'
				)
			})
		})
	})
})
