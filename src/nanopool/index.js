'use strict'

import _ from 'lodash'
import fetch from 'node-fetch'

const url = `https://api.nanopool.org/v1/eth/user/0xd987c7939f907c49f2069ff7ef09f403d52c1eed`
const ratesUrl = `https://api.coinbase.com/v2/exchange-rates`
export const getStats = () => fetch(url).then(results => results.json())
export const getRates = () => fetch(ratesUrl).then(results => results.json())