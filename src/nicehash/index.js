'use strict'

import fetch from 'node-fetch'

const baseUrl = `https://api.nicehash.com/api?`
const getOrdersQueryString = `method=orders.get&algo=`
const getProfitsQueryString = `method=stats.global.current`
const locationQueryString = `&location=`
export const getOrders = (algo = 20, location) => {
	const locationStr = location ? `${locationQueryString}${location}` : ``
	return fetch(`${baseUrl}${getOrdersQueryString}${algo}${locationStr}`)
	.then(res => res.json())
}

export const getProfits = location => {
	const locationStr = location ? `${locationQueryString}${location}` : ``
	return fetch(`${baseUrl}${getProfitsQueryString}${locationStr}`)
		.then(res => res.json())
}

export const pool = {
	europe: 0,
	usa: 1
}

export const algo = {
	daggerhashimoto: 20
}

/**
 * Look at europe and us
 * 10% or less of total GH/s for pool
 * start with fixed
 * order for fixed hours, 4 hours many
 * current profitablity per hashing power
 **/