'use strict'

import {log} from './http'
import {getOrders, getProfits, pool, algo} from './nicehash'
import _ from 'lodash'

setTimeout(() => {
	Promise.all([
		getOrders(algo.daggerhashimoto, pool.europe).then(results => ({
			miners: results.result.orders.reduce((memo, order) => memo+order.workers, 0),
			bestStandardPrice: _.last(_.filter(results.result.orders, order => order.workers !== 0))
		})),
		getOrders(algo.daggerhashimoto, pool.usa).then(results => ({
			miners: results.result.orders.reduce((memo, order) => memo+order.workers, 0),
			bestStandardPrice: _.last(_.filter(results.result.orders, order => order.workers !== 0))
		})),
		getProfits(pool.europe).then(profits => _.find(profits.result.stats, algo => algo.algo === 20)),
		getProfits(pool.usa).then(profits => _.find(profits.result.stats, algo => algo.algo === 20))
	])
	.then(([europeOrders, usaOrders, europeProfits, usaProfits]) => ({pools:[
		{
			pool:'europe',
			orders: europeOrders,
			profits: europeProfits
			
		},
		{
			pool:'usa',
			orders: usaOrders,
			profits: usaProfits
		}
	]}))
	.then(data => {
		console.log(JSON.stringify(data, null, '\t'))
	})
	
	
},5000)


// log(europeOrders)
// log(europeProfits)
// log(usaOrders)
// log(usaProfits)