import { expect, use } from 'chai'
import { Contract } from 'ethers'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import LibraryTest from '../../build/LibraryTest.json'

use(solidity)

describe('LibraryTest', () => {
	const provider = new MockProvider()
	const [deployer] = provider.getWallets()
	let lubraryTest: Contract
	before(async () => {
		lubraryTest = await deployContract(deployer, LibraryTest)
	})
	describe('LibraryTest: base64Encode', () => {
		it('convert to base64 encode.', async () => {
			const encoded = await lubraryTest.base64Encode('halo world')
			expect(encoded).to.be.equal('aGFsbyB3b3JsZA==')
		})
	})
	describe('LibraryTest: addressToChecksumString', () => {
		it('convert address to string.', async () => {
			const wallet = provider.createEmptyWallet()
			const addressString = await lubraryTest.addressToChecksumString(
				wallet.address
			)
			expect(addressString).to.be.equal(wallet.address)
		})
	})
})
