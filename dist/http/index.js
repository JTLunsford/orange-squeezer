'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.connect = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _util = require('util');

var _nodeStatic = require('node-static');

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const connect = exports.connect = () => new Promise((resolve, reject) => {

	console.log((0, _path.join)(__dirname, '../'));

	const fileServer = new _nodeStatic.Server((0, _path.join)(__dirname, '../'));
	const fsReadFile = (0, _util.promisify)(_fs2.default.readFile);

	const handler = (req, res) => {
		console.log(req.url);
		if (req.url === '/') {
			res.writeHead(301, {
				Location: "http" + (req.socket.encrypted ? "s" : "") + "://" + req.headers.host + '/index.html'
			});
			res.end();
		} else {
			req.addListener('end', function () {
				fileServer.serve(req, res);
			}).resume();
		}
	};

	const app = (0, _http.createServer)(handler);
	const io = (0, _socket2.default)(app);
	app.listen(process.env.C9_PORT || 8080);

	let connectedOnce = false;

	const log = msg => {
		console.log(msg);
		io.sockets.emit('event', typeof msg === 'object' ? JSON.stringify(msg) : msg);
	};

	io.on('connection', socket => {
		if (!connectedOnce) resolve({
			log
		});

		connectedOnce = true;
		console.log('client connected');
	});
});