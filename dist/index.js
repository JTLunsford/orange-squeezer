'use strict';

var _http = require('./http');

var _nicehash = require('./nicehash');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

setTimeout(() => {
	Promise.all([(0, _nicehash.getOrders)(_nicehash.algo.daggerhashimoto, _nicehash.pool.europe).then(results => ({
		miners: results.result.orders.reduce((memo, order) => memo + order.workers, 0),
		bestStandardPrice: _lodash2.default.last(_lodash2.default.filter(results.result.orders, order => order.workers !== 0))
	})), (0, _nicehash.getOrders)(_nicehash.algo.daggerhashimoto, _nicehash.pool.usa).then(results => ({
		miners: results.result.orders.reduce((memo, order) => memo + order.workers, 0),
		bestStandardPrice: _lodash2.default.last(_lodash2.default.filter(results.result.orders, order => order.workers !== 0))
	})), (0, _nicehash.getProfits)(_nicehash.pool.europe).then(profits => _lodash2.default.find(profits.result.stats, algo => algo.algo === 20)), (0, _nicehash.getProfits)(_nicehash.pool.usa).then(profits => _lodash2.default.find(profits.result.stats, algo => algo.algo === 20))]).then(([europeOrders, usaOrders, europeProfits, usaProfits]) => ({ pools: [{
			pool: 'europe',
			orders: europeOrders,
			profits: europeProfits

		}, {
			pool: 'usa',
			orders: usaOrders,
			profits: usaProfits
		}] })).then(data => {
		console.log(JSON.stringify(data, null, '\t'));
	});
}, 5000);

// log(europeOrders)
// log(europeProfits)
// log(usaOrders)
// log(usaProfits)