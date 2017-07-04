'use strict'

import {connect} from './http'
import {poolInfo, startOrder, getMyOrders, locations, checkBalance, fill, increasePrice, decreasePrice} from './nicehash'
import {tradeEthToBtc, refillNicehash} from './gdax'
import config from './config'
import _ from 'lodash'
import state from './state'

connect().then(({log}) => {
	//Trade all ETH to BTC every 10 minutes if larger than 0.01
	const tradeLoop = () => {
		tradeEthToBtc(config).then(msg => log(msg)).catch(({message}) => log(`ERROR: ${message}`))
		setTimeout(() => tradeLoop(), 1000 * 60 * 10)
	}
	tradeLoop()
	
	//Transfer all BTC to Nicehash every 10 minutes if larger than 0.01
	const moveToNicehashLoop = () => {
		refillNicehash(config).then(msg => log(msg)).catch(({message}) => log(`ERROR: ${message}`))
		setTimeout(() => moveToNicehashLoop(), 1000 * 60 * 10)
	}
	moveToNicehashLoop()
	
	//Every 10 minutes if Nicehash available balance larger than 0.01 check if open order, refill, if not open an order
	const fillLoop = () => {
		//TODO: refill or order
		fill(locations.usa, config).then(msg => log(msg)).catch(({message}) => log(`ERROR: ${message}`))
		//startOrder
		setTimeout(() => fillLoop(), 1000 * 60 * 10)
	}
	fillLoop()
	
	//Every minute check for best price +1 is lower than you, then decrease
	const decreaseLoop = () => {
		decreasePrice(locations.usa, config).then(msg => log(msg)).catch(({message}) => log(`ERROR: ${message}`))
		setTimeout(() => decreaseLoop(), 1000 * 60)
	}
	decreaseLoop()
	
	//Every minute check if zero miners, if none, raise to best price + 1
	const increaseLoop = () => {
		increasePrice(locations.usa, config).then(msg => log(msg)).catch(({message}) => log(`ERROR: ${message}`))
		setTimeout(() => increaseLoop(), 1000 * 60)
	}
	increaseLoop()

}).catch(({message}) => console.error('connect error',message))