'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.refillNicehash = exports.tradeEthToBtc = exports.getAccounts = undefined;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const apiUrl = `https://api.gdax.com`;

const methods = {
	post: 'POST',
	_get: 'GET'
};

const requestPaths = {
	orders: '/orders',
	accounts: '/accounts',
	withdrawalsCrypto: '/withdrawals/crypto'
};

const trimFloat = float => _lodash2.default.round(parseFloat(float), 8);

const signMessage = (config, method, requestPath, msg) => {
	const timestamp = Date.now() / 1000;
	const body = msg ? JSON.stringify(msg) : '';
	const what = timestamp + method + requestPath + body;
	const key = Buffer(config.gdax.accessSecret, 'base64');
	const hmac = _crypto2.default.createHmac('sha256', key);
	return {
		signedMsg: hmac.update(what).digest('base64'),
		timestamp: timestamp
	};
};

const callApi = (timestamp, signedMsg, config, method, requestPath, body) => (0, _nodeFetch2.default)(`${apiUrl}${requestPath}`, {
	method,
	headers: {
		'CB-ACCESS-KEY': config.gdax.accessKey,
		'CB-ACCESS-SIGN': signedMsg,
		'CB-ACCESS-TIMESTAMP': timestamp,
		'CB-ACCESS-PASSPHRASE': config.gdax.accessPassphrase,
		'content-type': 'application/json'
	},
	body: body ? body : void 0
});

const getAccounts = exports.getAccounts = config => {
	const {
		signedMsg,
		timestamp
	} = signMessage(config, methods._get, requestPaths.accounts);
	return callApi(timestamp, signedMsg, config, methods._get, requestPaths.accounts).then(res => {
		return res.json();
	});
};

const trade = (funds, config) => {
	const payload = {
		"funds": funds,
		"type": "market",
		"side": "sell",
		"product_id": "ETH-BTC"
	};

	const {
		signedMsg,
		timestamp
	} = signMessage(config, methods.post, requestPaths.orders, payload);
	return callApi(timestamp, signedMsg, config, methods.post, requestPaths.orders, JSON.stringify(payload)).then(res => {
		return res.json();
	});
};

const moveBtcToNicehash = (amount, config) => {
	const payload = {
		"amount": amount,
		"currency": "BTC",
		"crypto_address": config.nicehash.btcAddress
	};

	const {
		signedMsg,
		timestamp
	} = signMessage(config, methods.post, requestPaths.withdrawalsCrypto, payload);
	return callApi(timestamp, signedMsg, config, methods.post, requestPaths.withdrawalsCrypto, JSON.stringify(payload)).then(res => {
		return res.json();
	});
};

const tradeEthToBtc = exports.tradeEthToBtc = config => getAccounts(config).then(accounts => {
	const ethAccount = _lodash2.default.find(accounts, account => account.currency === 'ETH');
	const available = trimFloat(trimFloat(ethAccount.available) - 0.001);
	if (available > 0.01) {
		return trade(available, config);
	} else throw new Error(`only ${available} ETH available`);
});

const refillNicehash = exports.refillNicehash = config => getAccounts(config).then(accounts => {
	const btcAccount = _lodash2.default.find(accounts, account => account.currency === 'BTC');
	const available = trimFloat(trimFloat(btcAccount.available) - 0.001);
	if (available > 0.01) {
		return moveBtcToNicehash(available, config);
	} else throw new Error(`only ${available} BTC available`);
});