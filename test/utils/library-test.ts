import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { LibraryTest } from '../../typechain-types'

use(solidity)

describe('LibraryTest', () => {
	let libraryTest: LibraryTest

	before(async () => {
		const libraryTestFactory = await ethers.getContractFactory('LibraryTest')
		libraryTest = await libraryTestFactory.deploy()
	})

	describe('LibraryTest: base64Encode', () => {
		it('convert to base64 encode.', async () => {
			const encoded = await libraryTest.base64Encode('halo world')
			expect(encoded).to.be.equal('aGFsbyB3b3JsZA==')
		})
	})

	describe('LibraryTest: addressToChecksumString', () => {
		it('convert address to string.', async () => {
			const wallet = ethers.Wallet.createRandom()

			const addressString = await libraryTest.addressToChecksumString(
				wallet.address
			)
			expect(addressString).to.be.equal(wallet.address)
		})
	})
})
