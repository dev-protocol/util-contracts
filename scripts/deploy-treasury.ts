import { ethers } from 'hardhat'

async function main() {
	//! please check!!!!!!!!!
	const adminAddress = ''
	const registryAddress = ''
	//! !!!!!!!!!!!!!!!!!!!!!

	// GitHubMarket
	const treasuryV2Factory = await ethers.getContractFactory('TreasuryV2')
	const treasuryV2 = await treasuryV2Factory.deploy()
	await treasuryV2.deployed()

	console.log(`logic address:${treasuryV2.address}`)

	const data = ethers.utils.arrayify('0x')

	const treasuryProxyFactory = await ethers.getContractFactory('TreasuryProxy')
	const treasuryProxy = await treasuryProxyFactory.deploy(
		treasuryV2.address,
		adminAddress,
		data
	)
	await treasuryProxy.deployed()
	console.log(`proxy address:${treasuryProxy.address}`)

	const proxy = treasuryV2Factory.attach(treasuryProxy.address)
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
