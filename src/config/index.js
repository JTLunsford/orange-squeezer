'use strict'

export default {
	nicehash:{
		apiId: process.env.NH_API_ID || '',
		apiKey: process.env.NH_API_KEY || '',
		readOnlyApiKey: process.env.NH_READ_ONLY_API_KEY || '',
		startLimit: process.env.START_LIMIT || '50',
		btcAddress: process.env.NH_BTC_ADDRESS || ''
	},
	gdax:{
		accessKey: process.env.CB_ACCESS_KEY || '',
		accessSecret: process.env.CB_ACCESS_SECRET || '',
		accessPassphrase: process.env.CB_ACCESS_PASSPHRASE || '',
		productId: process.env.CB_PRODUCT_ID || 'ETH-BTC'
	},
	pool:{
		poolHost: process.env.POOL_HOST || '',
		poolPort: process.env.POOL_PORT || '',
		poolUser: process.env.POOL_USER || '',
		poolPass: process.env.POOL_PASS || ''
	}
}