import env, { ethers } from 'hardhat'

async function deployTreasury() {
	const config = env
	console.log(config)
	const Treasury = await ethers.getContractFactory('Treasury')
	const treasury = await Treasury.deploy()

	console.log('Treasury deployed to:', treasury.address)
}

deployTreasury()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
