'use strict'

import fetch from 'node-fetch'
import _ from 'lodash'

const baseUrl = `https://api.nicehash.com/api?`
const getOrdersTuple = ['method', 'orders.get']
const getProfitsTuple = ['method','stats.global.current']
const createOrderTuple = ['method', 'orders.create']
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

export const pool = {
	europe: addValue(locationTuple, 0),
	usa: addValue(locationTuple, 1)
}

export const algo = {
	daggerhashimoto: addValue(algoTuple, 20)
}

export const getOrders = (algo, location) => {
	let api = [getOrdersTuple, algo]
	api = location ? api.concat([location]) : api
	console.log(getApiUrl(api))
	return fetch(getApiUrl(api))
	.then(res => res.json())
}

export const getMyOrders = (algo, location, config) => {
	let api = [getOrdersTuple, algo]
	api = location ? api.concat([location]) : api
	api = api.concat(['my', addValue(apiIdTuple, config.apiId), addValue(apiKeyTuple, config.readOnlyApiKey)])
	console.log(getApiUrl(api))
	return fetch(getApiUrl(api))
	.then(res => res.json())
}

export const getProfits = location => {
	let api = [getProfitsTuple]
	api = location ? api.concat([location]) : api
	return fetch(getApiUrl(api))
		.then(res => res.json())
}

export const poolInfo = () => Promise.all([
	getOrders(algo.daggerhashimoto, pool.europe).then(convertResults),
	getOrders(algo.daggerhashimoto, pool.usa).then(convertResults),
	getProfits(pool.europe).then(profits => _.find(profits.result.stats, algo => algo.algo === 20)),
	getProfits(pool.usa).then(profits => _.find(profits.result.stats, algo => algo.algo === 20))
])
.then(([europeOrders, usaOrders, europeProfits, usaProfits]) => ({pools:[
	{
		pool:pool.europe,
		orders: europeOrders,
		profits: europeProfits
	},
	{
		pool:pool.usa,
		orders: usaOrders,
		profits: usaProfits
	}
]}))

export const createOrder = (log, config, amount, price, limit, location = pool.usa, orderAlgo = algo.daggerhashimoto) => {
	const orderLimit = addValue(limitTuple, limit || config.nicehash.startLimit)
	const orderPrice = addValue(priceTuple, price)
	const orderAmount = addValue(amountTuple, amount)
	
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
	log(getApiUrl(api))
	return fetch(getApiUrl(api))
		.then(res => res.json())
		.then(json => {
			if(json.result.error) throw new Error(json.result.error)
			return json
		})
}