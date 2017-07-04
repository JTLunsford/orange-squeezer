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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _http.connect)().then(({ log }) => {
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

	//Every minute check for best price +1 is lower than you, then decrease
	const decreaseLoop = () => {
		(0, _nicehash.decreasePrice)(_nicehash.locations.usa, _config2.default).then(msg => log(msg)).catch(({ message }) => log(`ERROR: ${message}`));
		setTimeout(() => decreaseLoop(), 1000 * 60);
	};
	decreaseLoop();

	//Every minute check if zero miners, if none, raise to best price + 1
	const increaseLoop = () => {
		(0, _nicehash.increasePrice)(_nicehash.locations.usa, _config2.default).then(msg => log(msg)).catch(({ message }) => log(`ERROR: ${message}`));
		setTimeout(() => increaseLoop(), 1000 * 60);
	};
	increaseLoop();
}).catch(({ message }) => console.error('connect error', message));