'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.saveOrder = exports.getOrder = exports.addHistory = exports.getHistory = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let commandHistory = [];

const getHistory = () => _lodash2.default.take(commandHistory, 50);

const addHistory = msg => commandHistory.unshift(msg);

let order = {};

const getOrder = () => Object.assign({}, order);

const saveOrder = o => {
	order = Object.assign({}, o);
};

exports.getHistory = getHistory;
exports.addHistory = addHistory;
exports.getOrder = getOrder;
exports.saveOrder = saveOrder;