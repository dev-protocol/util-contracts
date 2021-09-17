import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
// Import { HardhatUserConfig } from 'hardhat/types'

export default {
	networks: {
		localhost: {
			url: 'http://127.0.0.1:8545',
		},
	},
	solidity: '0.8.2',
}
