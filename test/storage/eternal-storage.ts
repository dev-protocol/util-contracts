import { expect, use } from 'chai'
import { constants, Signer, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { EternalStorage, EternalStorage__factory } from '../../typechain'

use(solidity)

describe('EternalStorage', () => {
	let user: Signer
	let test: Signer
	let eternalStorage: EternalStorage
	let eternalStorageOther: EternalStorage

	const getKey = (): string => {
		const tmp = Math.floor(Math.random() * 10000000)
		return utils.keccak256(utils.toUtf8Bytes(`key${tmp}`))
	}

	beforeEach(async () => {
		;[, user, test] = await ethers.getSigners()

		const eternalStorageFactory = (await ethers.getContractFactory(
			'EternalStorage'
		)) as EternalStorage__factory
		eternalStorage = await eternalStorageFactory.deploy()
		eternalStorageOther = eternalStorage.connect(user)
	})

	describe('changeOwner, ', () => {
		it('if anyone other than the owner executes it, an error occurs.', async () => {
			const userAddress = await user.getAddress()
			await expect(
				eternalStorageOther.changeOwner(userAddress)
			).to.be.revertedWith('not current owner')
		})

		it('if the owner changes, the write permissions will also change.', async () => {
			const key = getKey()
			let value = await eternalStorageOther.getUint(key)
			const userAddress = await user.getAddress()

			expect(value.toNumber()).to.be.equal(0)
			await expect(eternalStorageOther.setUint(key, 1)).to.be.revertedWith(
				'not current owner'
			)

			await eternalStorage.changeOwner(userAddress)
			await eternalStorageOther.setUint(key, 1)
			value = await eternalStorageOther.getUint(key)

			expect(value.toNumber()).to.be.equal(1)
		})
	})

	describe('Uint, ', () => {
		describe('get', async () => {
			it('if not set, can get initial value.', async () => {
				const key = getKey()
				const value = await eternalStorage.getUint(key)
				expect(value.toNumber()).to.be.equal(0)
			})
		})

		describe('set', async () => {
			it('can get the value you set.', async () => {
				const key = getKey()
				await eternalStorage.setUint(key, 1234)
				const value = await eternalStorage.getUint(key)
				expect(value.toNumber()).to.be.equal(1234)
			})

			it('only the owner can set.', async () => {
				const key = getKey()
				await expect(eternalStorageOther.setUint(key, 1234)).to.be.revertedWith(
					'not current owner'
				)
			})
		})

		describe('delete', async () => {
			it('it will return to the initial value when deleted.', async () => {
				const key = getKey()
				await eternalStorage.setUint(key, 1234)
				let value = await eternalStorage.getUint(key)
				expect(value.toNumber()).to.be.equal(1234)
				await eternalStorage.deleteUint(key)
				value = await eternalStorage.getUint(key)
				expect(value.toNumber()).to.be.equal(0)
			})

			it('only the owner can set it.', async () => {
				const key = getKey()
				await expect(eternalStorageOther.deleteUint(key)).to.be.revertedWith(
					'not current owner'
				)
			})
		})
	})

	describe('String, ', () => {
		describe('get', async () => {
			it('if not set, can get initial value.', async () => {
				const key = getKey()
				const value = await eternalStorage.getString(key)
				expect(value).to.be.equal('')
			})
		})

		describe('set', async () => {
			it('can get the value you set.', async () => {
				const key = getKey()
				await eternalStorage.setString(key, 'hogehoge')
				const value = await eternalStorage.getString(key)
				expect(value).to.be.equal('hogehoge')
			})

			it('only the owner can set.', async () => {
				const key = getKey()
				await expect(
					eternalStorageOther.setString(key, 'hogehoge')
				).to.be.revertedWith('not current owner')
			})
		})

		describe('delete', async () => {
			it('it will return to the initial value when deleted.', async () => {
				const key = getKey()
				await eternalStorage.setString(key, 'hogehoge')
				let value = await eternalStorage.getString(key)
				expect(value).to.be.equal('hogehoge')
				await eternalStorage.deleteString(key)
				value = await eternalStorage.getString(key)
				expect(value).to.be.equal('')
			})

			it('only the owner can set it.', async () => {
				const key = getKey()
				await expect(eternalStorageOther.deleteAddress(key)).to.be.revertedWith(
					'not current owner'
				)
			})
		})
	})

	describe('Address, ', () => {
		describe('get', async () => {
			it('if not set, can get initial value.', async () => {
				const key = getKey()
				const value = await eternalStorage.getAddress(key)
				expect(value).to.be.equal(constants.AddressZero)
			})
		})

		describe('set', async () => {
			let testAddress: string

			beforeEach(async () => {
				testAddress = await test.getAddress()
			})

			it('can get the value you set.', async () => {
				const key = getKey()
				await eternalStorage.setAddress(key, testAddress)
				const value = await eternalStorage.getAddress(key)
				expect(value).to.be.equal(testAddress)
			})

			it('only the owner can set.', async () => {
				const key = getKey()
				await expect(
					eternalStorageOther.setAddress(key, testAddress)
				).to.be.revertedWith('not current owner')
			})
		})

		describe('delete', async () => {
			it('it will return to the initial value when deleted.', async () => {
				const testAddress = await test.getAddress()
				const key = getKey()
				await eternalStorage.setAddress(key, testAddress)
				let value = await eternalStorage.getAddress(key)
				expect(value).to.be.equal(testAddress)
				await eternalStorage.deleteAddress(key)
				value = await eternalStorage.getAddress(key)
				expect(value).to.be.equal(constants.AddressZero)
			})

			it('only the owner can set it.', async () => {
				const key = getKey()
				await expect(eternalStorageOther.deleteAddress(key)).to.be.revertedWith(
					'not current owner'
				)
			})
		})
	})

	describe('Bytes, ', () => {
		describe('Bytes, ', () => {
			it('if not set, can get initial value.', async () => {
				const key = getKey()
				const value = await eternalStorage.getBytes(key)
				expect(value).to.be.equal(constants.HashZero)
			})
		})

		describe('set', async () => {
			it('can get the value you set.', async () => {
				const key = getKey()
				const setValue = getKey()
				await eternalStorage.setBytes(key, setValue)
				const value = await eternalStorage.getBytes(key)
				expect(value).to.be.equal(setValue)
			})

			it('only the owner can set.', async () => {
				const key = getKey()
				const setValue = getKey()
				await expect(
					eternalStorageOther.setBytes(key, setValue)
				).to.be.revertedWith('not current owner')
			})
		})

		describe('delete', async () => {
			it('it will return to the initial value when deleted.', async () => {
				const key = getKey()
				const setValue = getKey()
				await eternalStorage.setBytes(key, setValue)
				let value = await eternalStorage.getBytes(key)
				expect(value).to.be.equal(setValue)
				await eternalStorage.deleteBytes(key)
				value = await eternalStorage.getBytes(key)
				expect(value).to.be.equal(constants.HashZero)
			})

			it('only the owner can set it.', async () => {
				const key = getKey()
				await expect(eternalStorageOther.deleteBytes(key)).to.be.revertedWith(
					'not current owner'
				)
			})
		})
	})

	describe('Bool, ', () => {
		describe('get', async () => {
			it('if not set, can get initial value.', async () => {
				const key = getKey()
				const value = await eternalStorage.getBool(key)
				expect(value).to.be.equal(false)
			})
		})

		describe('set', async () => {
			it('can get the value you set.', async () => {
				const key = getKey()
				await eternalStorage.setBool(key, true)
				const value = await eternalStorage.getBool(key)
				expect(value).to.be.equal(true)
			})

			it('only the owner can set.', async () => {
				const key = getKey()
				await expect(eternalStorageOther.setBool(key, true)).to.be.revertedWith(
					'not current owner'
				)
			})
		})

		describe('delete', async () => {
			it('it will return to the initial value when deleted.', async () => {
				const key = getKey()
				await eternalStorage.setBool(key, true)
				let value = await eternalStorage.getBool(key)
				expect(value).to.be.equal(true)
				await eternalStorage.deleteBool(key)
				value = await eternalStorage.getBool(key)
				expect(value).to.be.equal(false)
			})

			it('only the owner can set it.', async () => {
				const key = getKey()
				await expect(eternalStorageOther.deleteBool(key)).to.be.revertedWith(
					'not current owner'
				)
			})
		})
	})

	describe('Int, ', () => {
		describe('get', async () => {
			it('if not set, can get initial value.', async () => {
				const key = getKey()
				const value = await eternalStorage.getInt(key)
				expect(value.toNumber()).to.be.equal(0)
			})
		})

		describe('set', async () => {
			it('can get the value you set.', async () => {
				const key = getKey()
				await eternalStorage.setInt(key, -1)
				const value = await eternalStorage.getInt(key)
				expect(value.toNumber()).to.be.equal(-1)
			})

			it('only the owner can set.', async () => {
				const key = getKey()
				await expect(eternalStorageOther.setInt(key, -1)).to.be.revertedWith(
					'not current owner'
				)
			})
		})

		describe('delete', async () => {
			it('it will return to the initial value when deleted.', async () => {
				const key = getKey()
				await eternalStorage.setInt(key, -2)
				let value = await eternalStorage.getInt(key)
				expect(value).to.be.equal(-2)
				await eternalStorage.deleteInt(key)
				value = await eternalStorage.getInt(key)
				expect(value).to.be.equal(0)
			})

			it('only the owner can set it.', async () => {
				const key = getKey()
				await expect(eternalStorageOther.deleteInt(key)).to.be.revertedWith(
					'not current owner'
				)
			})
		})
	})
})
