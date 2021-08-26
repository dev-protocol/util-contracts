import { ethers } from 'hardhat'
import { config } from 'dotenv'

async function deployTreasury() {
	const testAddress = '0x1000000000000000000000000000000000000000'
	const Config = config().parsed ? config().parsed : testAddress
	const Treasury = await ethers.getContractFactory('Treasury')
	const treasury = await Treasury.deploy(Config)

	console.log('Treasury deployed to:', treasury.address)
}

deployTreasury()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
