'use strict'

import {log} from './http'
import {
	poolInfo, 
	getMyOrders,
	algo,
	pool as locations,
	createOrder
} from './nicehash'
import config from './config'
import _ from 'lodash'

setTimeout(() => {
	//log(config)
	poolInfo().then(data => {
		const europe = _.find(data.pools, pool => pool.pool[1] === locations.europe[1])
		const usa = _.find(data.pools, pool => pool.pool[1] === locations.usa[1])
		
		const targetPool = parseInt(europe.orders.bestStandardPrice.price) < parseInt(usa.orders.bestStandardPrice.price) ? europe : usa

		log(`Starting Price in ${targetPool.pool[1]} pool: ${targetPool.orders.bestStandardPrice.price}`)
		log(`Creating order`)
		return createOrder(log, config,0.1, parseInt(targetPool.orders.bestStandardPrice.price))
	}).then(orderCreated => {
		console.log('order',orderCreated)
	}).catch( err => {
		console.log('err',err)
	})
},5000)

console.log(`See output on: http://atlminers-hash-miner-jtlunsford.c9users.io/index.html`)

// 1. gdax > withdraw/crypto api X amount of BTC to nicehash BTC wallet
// 2. nicehash > balance api = {"result":{"balance_confirmed":"0.00500000","balance_pending":"0.00000000"},"method":"balance"}
// 3. nicehash > create order api
// 4. nicehash > adjust price and limits for Y hours
// 5. nicehash > monitor order until closed or we cancel after Y hours
// 6. nanopool > monitor until unconfirmed_balance is 0.0(assuming all money is in GDAX ETH wallet)
// 7. gdax > trade ETH > BTC = X btc(original amount)
// <repeat> (edited)