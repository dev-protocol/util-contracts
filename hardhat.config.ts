/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import { HardhatUserConfig } from 'hardhat/config'
import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
	solidity: {
		version: '0.8.4',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		arbitrumRinkeby: {
			url: `https://arbitrum-rinkeby.infura.io/v3/${process.env.INFURA_KEY!}`,
			accounts: {
				mnemonic: process.env.MNEMONIC!,
			},
		},
	},
}

export default config
