'use strict'

import _ from 'lodash'

let commandHistory = []

const getHistory = () => _.take(commandHistory, 50)

const addHistory = msg => commandHistory.unshift(msg)

let order = {}

const getOrder = () => Object.assign({}, order)

const saveOrder = o => {
	order = Object.assign({}, o)
}

export {
	getHistory,
	addHistory,
	getOrder,
	saveOrder
}