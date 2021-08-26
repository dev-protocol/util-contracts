import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-ethers'

export default {
	networks: {
		localhost: {
			url: 'http://127.0.0.1:8545',
		},
	},
	solidity: '0.8.0',
}
