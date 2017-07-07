'use strict';

var _http = require('./http');

var _nicehash = require('./nicehash');

var _gdax = require('./gdax');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

var _nanopool = require('./nanopool');

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const r = _redis2.default.createClient();

(0, _http.connect)().then(({ log, wealth }) => {

	const updateWealth = amount => {
		r.rpush('wealth', amount, (err, total) => {
			r.lrange('wealth', 0, -1, (err, wot) => {
				const min = _lodash2.default.min(wot);
				const normalized = wot.map(w => _lodash2.default.round(_lodash2.default.round(w - min, 2) * 100, 0));
				//console.log(normalized)
				wealth(normalized);
			});
		});
	};

	//Trade all ETH to BTC every 10 minutes if larger than 0.01
	const tradeLoop = () => {
		(0, _gdax.tradeEthToBtc)(_config2.default).then(msg => log(msg)).catch(({ message }) => log(`ERROR: ${message}`));
		setTimeout(() => tradeLoop(), 1000 * 60 * 10);
	};
	tradeLoop();

	//Transfer all BTC to Nicehash every 10 minutes if larger than 0.01
	const moveToNicehashLoop = () => {
		(0, _gdax.refillNicehash)(_config2.default).then(msg => log(msg)).catch(({ message }) => log(`ERROR: ${message}`));
		setTimeout(() => moveToNicehashLoop(), 1000 * 60 * 10);
	};
	moveToNicehashLoop();

	//Every 10 minutes if Nicehash available balance larger than 0.01 check if open order, refill, if not open an order
	const fillLoop = () => {
		//TODO: refill or order
		(0, _nicehash.fill)(_nicehash.locations.usa, _config2.default).then(msg => log(msg)).catch(({ message }) => log(`ERROR: ${message}`));
		//startOrder
		setTimeout(() => fillLoop(), 1000 * 60 * 10);
	};
	fillLoop();

	//Every minute check if zero miners, if none, raise to best price + 1
	const adjustLoop = () => {
		(0, _nicehash.adjustPrice)(_nicehash.locations.usa, _config2.default).then(msg => log(msg)).catch(({ message }) => log(`ERROR: ${message}`));
		setTimeout(() => adjustLoop(), 1000 * 31);
	};
	adjustLoop();

	//Every minute check if zero miners, if none, raise to best price + 1
	const statsLoop = () => {
		(0, _nanopool.getStats)().then(({ data }) => {
			(0, _nicehash.getMyOrders)(_nicehash.locations.usa, _config2.default).then(orders => {
				(0, _gdax.getAccounts)(_config2.default).then(accounts => {
					//console.log(accounts)
					(0, _nicehash.checkBalance)(_config2.default, _nicehash.locations.usa).then(balance => {
						//console.log(balance.result)
						(0, _nanopool.getRates)().then(rates => {
							const gdaxBtc = _lodash2.default.find(accounts, a => a.currency === 'BTC');
							const gdaxEth = _lodash2.default.find(accounts, a => a.currency === 'ETH');
							const btc = [parseFloat(balance.result.balance_confirmed), parseFloat(balance.result.balance_pending), parseFloat(orders.result.orders.length !== 0 ? orders.result.orders[0].btc_paid : 0), parseFloat(orders.result.orders.length !== 0 ? orders.result.orders[0].btc_avail : 0), parseFloat(gdaxBtc.balance), parseFloat(gdaxEth.available)];
							const eth = [parseFloat(data.unconfirmed_balance), parseFloat(data.balance), parseFloat(gdaxEth.available)];
							const wealth = _lodash2.default.sum([_lodash2.default.sum(btc) / parseFloat(rates.data.rates.BTC), _lodash2.default.sum(eth) / parseFloat(rates.data.rates.ETH)]);
							log(`Current Wealth: $${wealth}`);
							updateWealth(wealth);
						}).catch(({ message }) => log(`ERROR: ${message}`));
					});
				});
			});
		});
		setTimeout(() => statsLoop(), 1000 * 60);
	};
	statsLoop();
}).catch(({ message }) => console.error('connect error', message));