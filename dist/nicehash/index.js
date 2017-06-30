'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.startOrder = exports.createOrder = exports.poolInfo = exports.getProfits = exports.getMyOrders = exports.getOrders = exports.algo = exports.locations = undefined;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const baseUrl = `https://api.nicehash.com/api?`;
const getOrdersTuple = ['method', 'orders.get'];
const getProfitsTuple = ['method', 'stats.global.current'];
const createOrderTuple = ['method', 'orders.create'];
const locationTuple = ['location'];
const algoTuple = ['algo'];
const apiIdTuple = ['id'];
const apiKeyTuple = ['key'];
const amountTuple = ['amount'];
const priceTuple = ['price'];
const limitTuple = ['limit'];
const poolHostTuple = ['pool_host'];
const poolPortTuple = ['pool_port'];
const poolUserTuple = ['pool_user'];
const poolPassTuple = ['pool_pass'];

const getQueryFromTuple = tuple => tuple instanceof Array ? `${tuple[0]}=${tuple[1]}` : tuple;
const getArrayOfQueryStringValues = opts => opts.map(getQueryFromTuple).join("&");
const getApiUrl = opts => `${baseUrl}${getArrayOfQueryStringValues(opts)}`;
const addValue = (tuple, value) => tuple.concat([value]);
const addCreds = (arr, config) => arr.concat([addValue(apiIdTuple, config.nicehash.apiId), addValue(apiKeyTuple, config.nicehash.apiKey)]);
const convertResults = results => ({
	miners: results.result.orders.reduce((memo, order) => memo + order.workers, 0),
	bestStandardPrice: _lodash2.default.last(_lodash2.default.filter(results.result.orders, order => order.workers !== 0))
});

const locations = exports.locations = {
	europe: addValue(locationTuple, 0),
	usa: addValue(locationTuple, 1)
};

const algo = exports.algo = {
	daggerhashimoto: addValue(algoTuple, 20)
};

const getOrders = exports.getOrders = (algo, location) => {
	let api = [getOrdersTuple, algo];
	api = location ? api.concat([location]) : api;
	console.log(getApiUrl(api));
	return (0, _nodeFetch2.default)(getApiUrl(api)).then(res => res.json());
};

const getMyOrders = exports.getMyOrders = (algo, location, config) => {
	let api = [getOrdersTuple, algo];
	api = location ? api.concat([location]) : api;
	api = api.concat(['my', addValue(apiIdTuple, config.apiId), addValue(apiKeyTuple, config.readOnlyApiKey)]);
	console.log(getApiUrl(api));
	return (0, _nodeFetch2.default)(getApiUrl(api)).then(res => res.json());
};

const getProfits = exports.getProfits = location => {
	let api = [getProfitsTuple];
	api = location ? api.concat([location]) : api;
	return (0, _nodeFetch2.default)(getApiUrl(api)).then(res => res.json());
};

const poolInfo = exports.poolInfo = () => Promise.all([getOrders(algo.daggerhashimoto, locations.europe).then(convertResults), getOrders(algo.daggerhashimoto, locations.usa).then(convertResults), getProfits(locations.europe).then(profits => _lodash2.default.find(profits.result.stats, algo => algo.algo === 20)), getProfits(locations.usa).then(profits => _lodash2.default.find(profits.result.stats, algo => algo.algo === 20))]).then(([europeOrders, usaOrders, europeProfits, usaProfits]) => ({ pools: [{
		pool: locations.europe,
		orders: europeOrders,
		profits: europeProfits
	}, {
		pool: locations.usa,
		orders: usaOrders,
		profits: usaProfits
	}] }));

const createOrder = exports.createOrder = (log, config, amount, price, limit, location = locations.usa, orderAlgo = algo.daggerhashimoto) => {
	const orderLimit = addValue(limitTuple, limit || config.nicehash.startLimit);
	const orderPrice = addValue(priceTuple, price);
	const orderAmount = addValue(amountTuple, amount);

	//TODO: Add on pool info

	const orderPoolHost = addValue(poolHostTuple, config.pool.poolHost);
	const orderPoolPort = addValue(poolPortTuple, config.pool.poolPort);
	const orderPoolUser = addValue(poolUserTuple, config.pool.poolUser);
	const orderPoolPass = addValue(poolPassTuple, config.pool.poolPass);

	let api = [createOrderTuple, location, orderAlgo, orderAmount, orderLimit, orderPrice, orderPoolHost, orderPoolPort, orderPoolUser, orderPoolPass];
	api = addCreds(api, config);
	log(getApiUrl(api));
	return (0, _nodeFetch2.default)(getApiUrl(api)).then(res => res.json()).then(json => {
		if (json.result.error) throw new Error(json.result.error);
		return json;
	});
};

const startOrder = exports.startOrder = (btc, log, config) => poolInfo().then(data => {
	const europe = _lodash2.default.find(data.pools, pool => pool.pool[1] === locations.europe[1]);
	const usa = _lodash2.default.find(data.pools, pool => pool.pool[1] === locations.usa[1]);

	const targetPool = parseInt(europe.orders.bestStandardPrice.price) < parseInt(usa.orders.bestStandardPrice.price) ? europe : usa;

	log(`Starting Price in ${targetPool.pool[1]} pool: ${targetPool.orders.bestStandardPrice.price}`);
	log(`Creating order`);
	return createOrder(log, config, btc, parseInt(targetPool.orders.bestStandardPrice.price));
}).then(orderCreated => {
	console.log('order', orderCreated);
}).catch(err => {
	console.log('err', err);
});