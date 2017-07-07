'use strict'

import {connect} from './http'
import {poolInfo, startOrder, getMyOrders, locations, checkBalance, fill, adjustPrice} from './nicehash'
import {tradeEthToBtc, refillNicehash, getAccounts} from './gdax'
import config from './config'
import _ from 'lodash'
import state from './state'
import {getStats, getRates} from './nanopool'
import redis from 'redis'

const r = redis.createClient()

connect().then(({log, wealth}) => {
	
	const updateWealth = amount => {
		r.rpush('wealth', amount, (err, total) => {
			r.lrange('wealth', 0, -1, (err, wot) => {
				const min = _.min(wot)
				const normalized = wot.map(w => _.round(_.round(w - min,2)*100,0))
				//console.log(normalized)
				wealth(normalized)
			})
		})
	}
	
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
	
	//Every minute check if zero miners, if none, raise to best price + 1
	const adjustLoop = () => {
		adjustPrice(locations.usa, config).then(msg => log(msg)).catch(({message}) => log(`ERROR: ${message}`))
		setTimeout(() => adjustLoop(), 1000 * 31)
	}
	adjustLoop()
	
	//Every minute check if zero miners, if none, raise to best price + 1
	const statsLoop = () => {
		getStats().then(({data}) => {
			getMyOrders(locations.usa, config).then(orders => {
				getAccounts(config).then(accounts => {
					//console.log(accounts)
					checkBalance(config, locations.usa).then(balance => {
						//console.log(balance.result)
						getRates().then(rates => {
							const gdaxBtc = _.find(accounts, a => a.currency === 'BTC')
							const gdaxEth = _.find(accounts, a => a.currency === 'ETH')
							const btc = [
								parseFloat(balance.result.balance_confirmed),
								parseFloat(balance.result.balance_pending),
								parseFloat(orders.result.orders.length !== 0 ? orders.result.orders[0].btc_paid : 0),
								parseFloat(orders.result.orders.length !== 0 ? orders.result.orders[0].btc_avail : 0),
								parseFloat(gdaxBtc.balance),
								parseFloat(gdaxEth.available)
							]
							const eth = [
								parseFloat(data.unconfirmed_balance),
								parseFloat(data.balance),
								parseFloat(gdaxEth.available)
							]
							const wealth = _.sum([
								_.sum(btc) / parseFloat(rates.data.rates.BTC), 
								_.sum(eth) / parseFloat(rates.data.rates.ETH)
							])
							log(`Current Wealth: $${wealth}`)
							updateWealth(wealth)
						}).catch(({message}) => log(`ERROR: ${message}`))
					})	
				})
			})
		})
		setTimeout(() => statsLoop(), 1000 * 60)
	}
	statsLoop()

}).catch(({message}) => console.error('connect error',message))