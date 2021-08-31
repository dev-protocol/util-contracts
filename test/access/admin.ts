import { expect, use } from 'chai'
import { Signer } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { AdminTest, AdminTest__factory } from '../../typechain'

use(solidity)

describe('Admin', () => {
	let deployer: Signer
	let newAdmin: Signer
	let admin: AdminTest

	beforeEach(async () => {
		;[deployer, newAdmin] = await ethers.getSigners()

		const adminFactory = (await ethers.getContractFactory(
			'AdminTest'
		)) as AdminTest__factory
		admin = await adminFactory.deploy()
	})

	describe('Admin: onlyAdmin', () => {
		describe('success', () => {
			it('functions can be executed if you have administrative privileges.', async () => {
				const value = await admin.getValueOnlyAdmin()

				expect(value.toNumber()).to.be.equal(1)
			})
		})

		describe('fail', () => {
			it('if you donot have administrative privileges, the function cannot be executed.', async () => {
				await expect(
					admin.connect(newAdmin).getValueOnlyAdmin()
				).to.be.revertedWith('admin only.')
			})
		})
	})

	describe('Admin: addAdmin, isAdmin', () => {
		describe('success', () => {
			it('administrators can add an administrator.', async () => {
				const newAdminAddress = await newAdmin.getAddress()
				await admin.addAdmin(newAdminAddress)
				const result = await admin.isAdmin(newAdminAddress)

				expect(result).to.be.equal(true)
			})
		})

		describe('fail', () => {
			it('no one but the administrator can add an administrator.', async () => {
				const newAdminAddress = await newAdmin.getAddress()

				await expect(
					admin.connect(newAdmin).addAdmin(newAdminAddress)
				).to.be.revertedWith('admin only.')
			})
		})
	})

	describe('Admin: deleteAdmin, isAdmin', () => {
		describe('success', () => {
			it('administrative privileges can be removed.', async () => {
				const deployerAddress = await deployer.getAddress()

				let result = await admin.isAdmin(deployerAddress)
				expect(result).to.be.equal(true)

				await admin.deleteAdmin(deployerAddress)

				result = await admin.isAdmin(deployerAddress)
				expect(result).to.be.equal(false)
			})
		})

		describe('fail', () => {
			it('only an administrator can run it.', async () => {
				const newAdminAddress = await newAdmin.getAddress()

				await expect(
					admin.connect(newAdmin).deleteAdmin(newAdminAddress)
				).to.be.revertedWith('admin only.')
			})
		})
	})
})
