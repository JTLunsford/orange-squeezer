'use strict';

var _socket = require('socket.io-client');

var client = _interopRequireWildcard(_socket);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const log = msg => document.body.innerHTML += `<div>${msg}</div>`;

const socket = client();
socket.on('connect', () => log('connect'));
socket.on('event', log);
socket.on('disconnect', () => log('disco'));

setInterval(() => window.scrollTo(0, document.body.scrollHeight), 1000);