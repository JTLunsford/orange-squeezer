'use strict';

var _http = require('./http');

var _nicehash = require('./nicehash');

var _gdax = require('./gdax');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Trade all ETH to BTC every 10 minutes if larger than 0.01
const tradeLoop = () => {
	(0, _gdax.tradeEthToBtc)(_config2.default).then(_http.log).catch(_http.log);
	setTimeout(() => tradeLoop(), 1000 * 60 * 10);
};
tradeLoop();

//Transfer all BTC to Nicehash every 10 minutes if larger than 0.01
const moveToNicehashLoop = () => {
	(0, _gdax.refillNicehash)(_config2.default).then(_http.log).catch(_http.log);
	setTimeout(() => moveToNicehashLoop(), 1000 * 60 * 10);
};
moveToNicehashLoop();

//Every 10 minutes if Nicehash available balance larger than 0.01 check if open order, refill, if not open an order
const fillLoop = () => {
	//TODO: refill or order
	setTimeout(() => fillLoop(), 1000 * 60 * 10);
};
fillLoop();

//Every 11 minutes check for best price +1 is lower than you, then decrease
const decreaseLoop = () => {
	//TODO: decrease
	setTimeout(() => decreaseLoop(), 1000 * 60 * 11);
};
decreaseLoop();

//Every minute check if zero miners, if none, raise to best price + 1
const increaseLoop = () => {
	//TODO: increase
	setTimeout(() => increaseLoop(), 1000 * 60);
};
increaseLoop();