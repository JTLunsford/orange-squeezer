import * as client from 'socket.io-client'
import * as spark from 'sparklines'

const chart = document.createElement("span")
chart.id = 'chart'
chart.style.width = '100px'
chart.style.height = '30px'
document.body.appendChild(chart)

const logs = document.createElement("div")
logs.id = 'logs'
document.body.appendChild(logs)

let sparkline = new spark(document.getElementById("chart"))
sparkline.draw([1,2,3])

const log = msg => logs.innerHTML += `<div>${msg}</div>`
const wot = data => {
	//console.log(data)
	sparkline.draw(data)
	//spark.draw(document.getElementById("chart"),data, {})
}

const socket = client()
socket.on('connect', () => log('connect'))
socket.on('event', log)
socket.on('disconnect', () => log('disco'))
socket.on('wot', wot)