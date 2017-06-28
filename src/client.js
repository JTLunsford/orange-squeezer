import * as client from 'socket.io-client'

const log = msg => document.body.innerHTML += `<div>${msg}</div>`

const socket = client()
socket.on('connect', () => log('connect'))
socket.on('event', log)
socket.on('disconnect', () => log('disco'))

setInterval(() => window.scrollTo(0,document.body.scrollHeight), 1000)