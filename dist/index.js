'use strict';

var _http = require('./http');

var _nicehash = require('./nicehash');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

setTimeout(() => {
	//log(config)
	(0, _nicehash.poolInfo)().then(data => {
		const europe = _lodash2.default.find(data.pools, pool => pool.pool[1] === _nicehash.pool.europe[1]);
		const usa = _lodash2.default.find(data.pools, pool => pool.pool[1] === _nicehash.pool.usa[1]);

		const targetPool = parseInt(europe.orders.bestStandardPrice.price) < parseInt(usa.orders.bestStandardPrice.price) ? europe : usa;

		(0, _http.log)(`Starting Price in ${targetPool.pool[1]} pool: ${targetPool.orders.bestStandardPrice.price}`);
		(0, _http.log)(`Creating order`);
		return (0, _nicehash.createOrder)(_http.log, _config2.default, 0.1, parseInt(targetPool.orders.bestStandardPrice.price));
	}).then(orderCreated => {
		console.log('order', orderCreated);
	}).catch(err => {
		console.log('err', err);
	});
}, 5000);

console.log(`See output on: http://atlminers-hash-miner-jtlunsford.c9users.io/index.html`);

// 1. gdax > withdraw/crypto api X amount of BTC to nicehash BTC wallet
// 2. nicehash > balance api = {"result":{"balance_confirmed":"0.00500000","balance_pending":"0.00000000"},"method":"balance"}
// 3. nicehash > create order api
// 4. nicehash > adjust price and limits for Y hours
// 5. nicehash > monitor order until closed or we cancel after Y hours
// 6. nanopool > monitor until unconfirmed_balance is 0.0(assuming all money is in GDAX ETH wallet)
// 7. gdax > trade ETH > BTC = X btc(original amount)
// <repeat> (edited)