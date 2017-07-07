'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRates = exports.getStats = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const url = `https://api.nanopool.org/v1/eth/user/0xd987c7939f907c49f2069ff7ef09f403d52c1eed`;
const ratesUrl = `https://api.coinbase.com/v2/exchange-rates`;
const getStats = exports.getStats = () => (0, _nodeFetch2.default)(url).then(results => results.json());
const getRates = exports.getRates = () => (0, _nodeFetch2.default)(ratesUrl).then(results => results.json());