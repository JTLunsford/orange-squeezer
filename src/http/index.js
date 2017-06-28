'use strict'

import fs from 'fs'
import {createServer} from 'http'
import socketio from 'socket.io'
import {promisify} from 'util'
import {Server as staticFileServer} from 'node-static'
import {join, resolve} from 'path'

console.log(join( __dirname, '../'))

const fileServer = new staticFileServer(join( __dirname, '../'))
const fsReadFile = promisify(fs.readFile)

const handler  = (req, res) => {
	console.log(req.url)
	if(req.url === '/'){
		res.writeHead(301, {
			Location: "http" + (req.socket.encrypted ? "s" : "") + "://" + 
			req.headers.host + '/index.html'
		});
		res.end();
	}
	else{
		req.addListener('end', function () {
			fileServer.serve(req, res);
		}).resume();	
	}
}

const app = createServer(handler)
const io = socketio(app)
app.listen(process.env.C9_PORT || 8080)

io.on('connection', socket => {
	console.log('client connected')
})

export const log = msg => {
	console.log(msg)
	io.sockets.emit('event', typeof msg === 'object' ? JSON.stringify(msg) : msg)
}