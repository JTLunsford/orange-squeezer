'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.algo = exports.pool = exports.getProfits = exports.getOrders = undefined;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const baseUrl = `https://api.nicehash.com/api?`;
const getOrdersQueryString = `method=orders.get&algo=`;
const getProfitsQueryString = `method=stats.global.current`;
const locationQueryString = `&location=`;
const getOrders = exports.getOrders = (algo = 20, location) => {
	const locationStr = location ? `${locationQueryString}${location}` : ``;
	return (0, _nodeFetch2.default)(`${baseUrl}${getOrdersQueryString}${algo}${locationStr}`).then(res => res.json());
};

const getProfits = exports.getProfits = location => {
	const locationStr = location ? `${locationQueryString}${location}` : ``;
	return (0, _nodeFetch2.default)(`${baseUrl}${getProfitsQueryString}${locationStr}`).then(res => res.json());
};

const pool = exports.pool = {
	europe: 0,
	usa: 1
};

const algo = exports.algo = {
	daggerhashimoto: 20

	/**
  * Look at europe and us
  * 10% or less of total GH/s for pool
  * start with fixed
  * order for fixed hours, 4 hours many
  * current profitablity per hashing power
  **/

};