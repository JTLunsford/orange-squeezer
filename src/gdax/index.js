'use strict'

import fetch from 'node-fetch'
import crypto from 'crypto'
import _ from 'lodash'

const apiUrl = `https://api.gdax.com`

const methods = {
	post: 'POST',
	_get: 'GET'
}

const requestPaths = {
	orders: '/orders',
	accounts: '/accounts',
	withdrawalsCrypto: '/withdrawals/crypto'
}

const trimFloat = float => _.round(parseFloat(float), 8)

const signMessage = (config, method, requestPath, msg) => {
	const timestamp = Date.now() / 1000
	const body = msg ? JSON.stringify(msg) : ''
	const what = timestamp + method + requestPath + body
	const key = Buffer(config.gdax.accessSecret, 'base64')
	const hmac = crypto.createHmac('sha256', key)
	return {
		signedMsg: hmac.update(what).digest('base64'),
		timestamp: timestamp
	}
}

const callApi = (timestamp, signedMsg, config, method, requestPath, body) => fetch(`${apiUrl}${requestPath}`, {
	method,
	headers: {
		'CB-ACCESS-KEY':config.gdax.accessKey,
		'CB-ACCESS-SIGN':signedMsg,
		'CB-ACCESS-TIMESTAMP':timestamp,
		'CB-ACCESS-PASSPHRASE':config.gdax.accessPassphrase,
		'content-type':'application/json'
	},
	body: body ? body : void 0
})

export const getAccounts = config => {
	const { 
		signedMsg, 
		timestamp 
	} = signMessage(
		config,
		methods._get,
		requestPaths.accounts
	)
	return callApi(timestamp, signedMsg, config, methods._get, requestPaths.accounts)
		.then(res => {
			return res.json()
		})
}

const trade = (funds, config) => {
	const payload = {
		"funds": funds,
		"type": "market",
		"side": "sell",
		"product_id": "ETH-BTC"
	}
	
	const { 
		signedMsg, 
		timestamp 
	} = signMessage(
		config,
		methods.post,
		requestPaths.orders,
		payload
	)
	return callApi(timestamp, signedMsg, config, methods.post, requestPaths.orders, JSON.stringify(payload))
		.then(res => {
			return res.json()
		})
}

const moveBtcToNicehash = (amount, config) => {
	const payload = {
		"amount": amount,
		"currency": "BTC",
		"crypto_address": config.nicehash.btcAddress
	}
	
	const { 
		signedMsg, 
		timestamp 
	} = signMessage(
		config,
		methods.post,
		requestPaths.withdrawalsCrypto,
		payload
	)
	return callApi(timestamp, signedMsg, config, methods.post, requestPaths.withdrawalsCrypto, JSON.stringify(payload))
		.then(res => {
			return res.json()
		})
}


export const tradeEthToBtc = config => getAccounts(config).then(accounts => {
	const ethAccount = _.find(accounts, account => account.currency === 'ETH')
	const available = trimFloat(trimFloat(ethAccount.available) - 0.001)
	if(available > 0.01){
		return trade(available, config)
	}
	else throw new Error(`only ${available} ETH available`)
})

export const refillNicehash = config => getAccounts(config).then(accounts => {
	const btcAccount = _.find(accounts, account => account.currency === 'BTC')
	const available = trimFloat(trimFloat(btcAccount.available) - 0.001)
	if(available > 0.01){
		return moveBtcToNicehash(available, config)
	}
	else throw new Error(`only ${available} BTC available`)
})