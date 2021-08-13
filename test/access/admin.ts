import { expect, use } from 'chai'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import AdminTest from '../../build/AdminTest.json'

use(solidity)

describe('Admin', () => {
	const provider = new MockProvider()
	const [deployer, newAdmin] = provider.getWallets()

	describe('Admin: onlyAdmin', () => {
		describe('success', () => {
			it('functions can be executed if you have administrative privileges.', async () => {
				const admin = await deployContract(deployer, AdminTest)
				const value = await admin.getValueOnlyAdmin()
				expect(value.toNumber()).to.be.equal(1)
			})
		})
		describe('fail', () => {
			it('if you donot have administrative privileges, the function cannot be executed.', async () => {
				const admin = await deployContract(deployer, AdminTest)
				const otherAdmin = admin.connect(newAdmin)
				await expect(otherAdmin.getValueOnlyAdmin()).to.be.revertedWith(
					'admin only.'
				)
			})
		})
	})
	describe('Admin: addAdmin, isAdmin', () => {
		describe('success', () => {
			it('administrators can add an administrator.', async () => {
				const admin = await deployContract(deployer, AdminTest)
				await admin.addAdmin(newAdmin.address)
				const result = await admin.isAdmin(newAdmin.address)
				expect(result).to.be.equal(true)
			})
		})
		describe('fail', () => {
			it('no one but the administrator can add an administrator.', async () => {
				const admin = await deployContract(deployer, AdminTest)
				const otherAdmin = admin.connect(newAdmin)
				await expect(otherAdmin.addAdmin(newAdmin.address)).to.be.revertedWith(
					'admin only.'
				)
			})
		})
	})
	describe('Admin: deleteAdmin, isAdmin', () => {
		describe('success', () => {
			it('administrative privileges can be removed.', async () => {
				const admin = await deployContract(deployer, AdminTest)
				let result = await admin.isAdmin(deployer.address)
				expect(result).to.be.equal(true)
				await admin.deleteAdmin(deployer.address)
				result = await admin.isAdmin(deployer.address)
				expect(result).to.be.equal(false)
			})
		})
		describe('fail', () => {
			it('only an administrator can run it.', async () => {
				const admin = await deployContract(deployer, AdminTest)
				const otherAdmin = admin.connect(newAdmin)
				await expect(otherAdmin.deleteAdmin(admin.address)).to.be.revertedWith(
					'admin only.'
				)
			})
		})
	})
})
