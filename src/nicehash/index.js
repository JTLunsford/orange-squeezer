'use strict'

import fetch from 'node-fetch'
import _ from 'lodash'

const baseUrl = `https://api.nicehash.com/api?`
const getOrdersTuple = ['method', 'orders.get']
const getProfitsTuple = ['method','stats.global.current']
const createOrderTuple = ['method', 'orders.create']
const refillOrderTuple = ['method', 'orders.refill']
const limitOrderTuple = ['method', 'orders.set.limit']
const setPriceTuple = ['method', 'orders.set.price']
const decreasePriceTuple = ['method', 'orders.set.price.decrease']
const balanceTuple = ['method', 'balance']
const locationTuple = ['location']
const algoTuple = ['algo']
const apiIdTuple = ['id']
const apiKeyTuple = ['key']
const amountTuple = ['amount']
const priceTuple = ['price']
const limitTuple = ['limit']
const poolHostTuple = ['pool_host']
const poolPortTuple = ['pool_port']
const poolUserTuple = ['pool_user']
const poolPassTuple = ['pool_pass']
const orderTuple = ['order']

const getQueryFromTuple = tuple => tuple instanceof Array ? `${tuple[0]}=${tuple[1]}` : tuple
const getArrayOfQueryStringValues = opts => opts.map(getQueryFromTuple).join("&")
const getApiUrl = opts => `${baseUrl}${getArrayOfQueryStringValues(opts)}`
const addValue = (tuple, value) => tuple.concat([value])
const addCreds = (arr, config) => arr.concat([
	addValue(apiIdTuple, config.nicehash.apiId), 
	addValue(apiKeyTuple, config.nicehash.apiKey)
])
const convertResults = results => ({
	miners: results.result.orders.reduce((memo, order) => memo+order.workers, 0),
	bestStandardPrice: _.last(_.filter(results.result.orders, order => order.workers !== 0))
})

const trimFloat = float => _.round(parseFloat(float), 8)

export const locations = {
	europe: addValue(locationTuple, 0),
	usa: addValue(locationTuple, 1)
}

export const algo = {
	daggerhashimoto: addValue(algoTuple, 20)
}

export const getOrders = (algo, location) => {
	let api = [getOrdersTuple, algo]
	api = location ? api.concat([location]) : api
	return fetch(getApiUrl(api))
	.then(res => res.json())
}

export const getMyOrders = (location, config) => {
	let api = [getOrdersTuple, algo.daggerhashimoto, location]
	api = addCreds(api, config)
	api = api.concat(['my'])
	return fetch(getApiUrl(api)).then(res => res.json())
}

export const getProfits = location => {
	let api = [getProfitsTuple]
	api = location ? api.concat([location]) : api
	return fetch(getApiUrl(api))
		.then(res => res.json())
}

export const poolInfo = () => Promise.all([
	getOrders(algo.daggerhashimoto, locations.europe).then(convertResults),
	getOrders(algo.daggerhashimoto, locations.usa).then(convertResults),
	getProfits(locations.europe).then(profits => _.find(profits.result.stats, algo => algo.algo === 20)),
	getProfits(locations.usa).then(profits => _.find(profits.result.stats, algo => algo.algo === 20))
])
.then(([europeOrders, usaOrders, europeProfits, usaProfits]) => ({pools:[
	{
		pool:locations.europe,
		orders: europeOrders,
		profits: europeProfits
	},
	{
		pool:locations.usa,
		orders: usaOrders,
		profits: usaProfits
	}
]}))

export const createOrder = (config, amount, price, limit, location = locations.usa, orderAlgo = algo.daggerhashimoto) => {
	const orderLimit = addValue(limitTuple, trimFloat(limit) || config.nicehash.startLimit)
	const orderPrice = addValue(priceTuple, trimFloat(price))
	const orderAmount = addValue(amountTuple, trimFloat(amount))
	
	//TODO: Add on pool info
	
	const orderPoolHost = addValue(poolHostTuple, config.pool.poolHost)
	const orderPoolPort = addValue(poolPortTuple, config.pool.poolPort)
	const orderPoolUser = addValue(poolUserTuple, config.pool.poolUser)
	const orderPoolPass = addValue(poolPassTuple, config.pool.poolPass)
	
	let api = [
		createOrderTuple, 
		location, 
		orderAlgo, 
		orderAmount, 
		orderLimit, 
		orderPrice,
		orderPoolHost,
		orderPoolPort,
		orderPoolUser,
		orderPoolPass
	]
	api = addCreds(api, config)
	
	console.log(getApiUrl(api))
	return fetch(getApiUrl(api))
		.then(res => res.json())
		.then(json => {
			if(json.result.error) throw new Error(json.result.error)
			return json
		})
}

export const startOrder = (btc, location, config) => poolInfo().then(data => {
	const targetPool = _.find(data.pools, pool => pool.pool[1] === location[1])
	console.log(targetPool)
	console.log(`Starting Price in ${targetPool.pool[1]} pool: ${targetPool.orders.bestStandardPrice.price}`)
	console.log(`Creating order`)
	const bestPrice = trimFloat(trimFloat(targetPool.orders.bestStandardPrice.price) + 0.0001)
	console.log(`Best Price: ${bestPrice}`)
	const limit = getLimitByHours(bestPrice, btc, config.nicehash.timespan)
	console.log(`Selected Limit: ${limit}`)
	return createOrder(config, btc, bestPrice, limit, targetPool.pool)
}).then(orderCreated => {
	console.log('order',orderCreated)
}).catch(err => {
	console.log('err',err)
})

export const checkBalance = config => {
	let api = [balanceTuple]
	api = addCreds(api, config)
	return fetch(getApiUrl(api))
	.then(res => res.json())
}

export const getLimitByHours = (price, amount, hours) => ((amount/price)*24)/hours

export const getTimeSpanEstimate = (price, amount, limit) => ((amount/limit)/price)*24



export const refillOrder = (btc, id, location, config) => {
	let api = [
		refillOrderTuple, 
		location,
		algo.daggerhashimoto,
		addValue(amountTuple, trimFloat(btc)),
		addValue(orderTuple, id)
	]
	api = addCreds(api, config)
	return fetch(getApiUrl(api))
		.then(res => res.json())
		.then(json => {
			if(json.result.error) throw new Error(json.result.error)
			return json
		})
}

export const adjustLimit = (order, location, config) => {
	let api = [
		limitOrderTuple, 
		location,
		algo.daggerhashimoto,
		addValue(orderTuple, order.id),
		addValue(limitTuple, trimFloat(getLimitByHours(order.price, order.btc_avail, config.nicehash.timespan)))
	]
	api = addCreds(api, config)
	return fetch(getApiUrl(api))
		.then(res => res.json())
		.then(json => {
			if(json.result.error) throw new Error(json.result.error)
			return json
		})
}

export const setOrderPrice = (id, price, location, config) => {
	let api = [
		setPriceTuple, 
		location,
		algo.daggerhashimoto,
		addValue(orderTuple, id),
		addValue(priceTuple, trimFloat(price))
	]
	api = addCreds(api, config)
	return fetch(getApiUrl(api))
		.then(res => res.json())
		.then(json => {
			if(json.result.error) throw new Error(json.result.error)
			return json
		})
}

export const setPriceDecrease = (id, location, config) => {
	let api = [
		decreasePriceTuple, 
		location,
		algo.daggerhashimoto,
		addValue(orderTuple, id)
	]
	api = addCreds(api, config)
	return fetch(getApiUrl(api))
		.then(res => res.json())
		.then(json => {
			if(json.result.error) throw new Error(json.result.error)
			return json
		})
}

export const fill = (location, config) => checkBalance(config, location = locations.usa).then(balance => {
	console.log(balance.result)
	const confirmedBalance = trimFloat(balance.result.balance_confirmed)
	if(confirmedBalance > 0.01) return getMyOrders(location, config).then(({result:{orders}}) => {
		if(orders.length === 0) return startOrder(confirmedBalance, location, config)
		else return refillOrder(confirmedBalance, pool.orders[0].id, location, config).then(json => {
			if(json.result.error) throw new Error(`refill order error: ${json.result.error}`)
			else return adjustLimit(pool.orders[0], location, config)
		})
	}).catch(({message}) => console.log(`GET MY ORDERS ERROR: ${message}`))
	else throw new Error(`low balance ${confirmedBalance}`)
}).catch(({message}) => `LOW NICEHASH BALANCE: ${message}`)

export const increasePrice = (location, config) => getMyOrders(location, config).then(({result:{orders}}) => {
	if(orders.length === 0) throw new Error(`no orders to increase`)
	else return poolInfo().then(data => {
		console.log(orders[0])
		const targetPool = _.find(data.pools, pool => pool.pool[1] === location[1])
		const bestPrice = trimFloat(trimFloat(targetPool.orders.bestStandardPrice.price) + 0.0001)
		const orderPrice = trimFloat(orders[0].price)
		console.log(`Current Order Price: ${orderPrice}`)
		console.log(`Best Price: ${bestPrice}`)
		if(orderPrice < bestPrice) return setOrderPrice(orders[0].id, bestPrice, location, config)
		else return `price is fine - no increase`
	})
}).catch(({message}) => `INCREASE PRICE ERROR: ${message}`)

export const decreasePrice = (location, config) => getMyOrders(location, config).then(({result:{orders}}) => {
	if(orders.length === 0) throw new Error(`no orders to decrease`)
	else return poolInfo().then(data => {
		const targetPool = _.find(data.pools, pool => pool.pool[1] === location[1])
		const bestPrice = trimFloat(trimFloat(targetPool.orders.bestStandardPrice.price) + 0.0001)
		const orderPrice = trimFloat(orders[0].price)
		console.log(`Current Order Price: ${orderPrice}`)
		console.log(`Best Price: ${bestPrice}`)
		if(orderPrice > bestPrice) return setPriceDecrease(orders[0].id, location, config)
		else return `price is fine - no decrease`
	})
}).catch(({message}) => `DECREASE PRICE ERROR: ${message}`)
	