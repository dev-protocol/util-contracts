/* eslint-disable no-implicit-globals */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { ethers } from 'hardhat'

async function main() {
	//! please check!!!!!!!!!
	const adminAddress = ''
	const registryAddress = ''
	//! !!!!!!!!!!!!!!!!!!!!!

	// GitHubMarket
	const treasuryL2Factory = await ethers.getContractFactory('TreasuryL2')
	const treasuryL2 = await treasuryL2Factory.deploy()
	await treasuryL2.deployed()

	console.log(`logic address:${treasuryL2.address}`)

	const data = ethers.utils.arrayify('0x')

	const treasuryProxyFactory = await ethers.getContractFactory('TreasuryProxy')
	const treasuryProxy = await treasuryProxyFactory.deploy(
		treasuryL2.address,
		adminAddress,
		data
	)
	await treasuryProxy.deployed()
	console.log(`proxy address:${treasuryProxy.address}`)

	const proxy = treasuryL2Factory.attach(treasuryProxy.address)
	await proxy.initialize(registryAddress)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Memo
// set adminAddress and registryAddress and update .env file
// and execute this command
// npx hardhat run --network arbitrumRinkeby scripts/deploy-treasury.ts
