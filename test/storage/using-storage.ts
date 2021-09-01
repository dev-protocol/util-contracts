import { expect, use } from 'chai'
import { Signer, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { UsingStorageTest, UsingStorageTest__factory } from '../../typechain'

use(solidity)

describe('UsingStorage', () => {
	let deployer: Signer
	let newAdmin: Signer
	let user: Signer
	let usingStorage: UsingStorageTest

	beforeEach(async () => {
		;[deployer, newAdmin, user] = await ethers.getSigners()

		const usingStorageFactory = (await ethers.getContractFactory(
			'UsingStorageTest'
		)) as UsingStorageTest__factory
		usingStorage = await usingStorageFactory.deploy()
	})

	describe('UsingStorage: addStorageOwner, deleteStorageOwner', () => {
		describe('success', async () => {
			const checkAdminAndStorageOwnerAuthority = async (
				// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
				us: UsingStorageTest,
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
				const newAdminAddress = await newAdmin.getAddress()

				await checkAdminAndStorageOwnerAuthority(
					usingStorage,
					newAdminAddress,
					false,
					false
				)

				await usingStorage.addStorageOwner(newAdminAddress)

				await checkAdminAndStorageOwnerAuthority(
					usingStorage,
					newAdminAddress,
					false,
					true
				)
			})

			it('can remove storage administrator privileges.', async () => {
				const deployerAddress = await deployer.getAddress()

				await checkAdminAndStorageOwnerAuthority(
					usingStorage,
					deployerAddress,
					true,
					true
				)

				await usingStorage.deleteStorageOwner(deployerAddress)

				await checkAdminAndStorageOwnerAuthority(
					usingStorage,
					deployerAddress,
					true,
					false
				)
			})
		})

		describe('fail', async () => {
			let newAdminAddress: string

			before(async () => {
				newAdminAddress = await newAdmin.getAddress()
			})

			it('no one but admin can be executed (addAdmin).', async () => {
				await expect(
					usingStorage.connect(newAdmin).addStorageOwner(newAdminAddress)
				).to.be.revertedWith('admin only.')
			})

			it('no one but admin can be executed (deleteAdmin).', async () => {
				await expect(
					usingStorage.connect(newAdmin).deleteStorageOwner(newAdminAddress)
				).to.be.revertedWith('admin only.')
			})
		})
	})

	describe('UsingStorage: eternalStorage', () => {
		it('returns EternalStorage instance.', async () => {
			await usingStorage.createStorage({
				gasLimit: 2000000,
			})
			const result = await usingStorage.getEternalStorageAddress()
			const expected = await usingStorage.getStorageAddress()
			expect(result).to.be.equal(expected)
		})
	})

	describe('UsingStorage; hasStorage, createStorage', () => {
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
				const userAddress = await user.getAddress()
				const authority = await usingStorage.isStorageOwner(userAddress)

				expect(authority).to.be.equal(false)
				await expect(
					usingStorage.connect(user).createStorage()
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
		let usingStorageNext: UsingStorageTest

		beforeEach(async () => {
			await usingStorage.createStorage()
			await usingStorage.setUInt(1)

			const usingStorageNextFact = (await ethers.getContractFactory(
				'UsingStorageTest'
			)) as UsingStorageTest__factory
			usingStorageNext = await usingStorageNextFact.deploy()
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
			let userAddress: string

			before(async () => {
				userAddress = await user.getAddress()
			})

			it('failure if you donot have storage owner privileges.(setStorage)', async () => {
				const storageAddress = await usingStorage.getStorageAddress()
				const authority = await usingStorage.isStorageOwner(userAddress)

				expect(authority).to.be.equal(false)
				await expect(
					usingStorage.connect(user).setStorage(storageAddress)
				).to.be.revertedWith('storage owner only.')
			})

			it('failure if you donot have storage owner privileges.(changeOwner)', async () => {
				const authority = await usingStorage.isStorageOwner(userAddress)

				expect(authority).to.be.equal(false)
				await expect(
					usingStorage.connect(user).changeOwner(usingStorage.address)
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
