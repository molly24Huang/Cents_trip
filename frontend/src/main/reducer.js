import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { routerReducer } from 'react-router-redux'
import _ from 'lodash'

const reducers = {}
const yamlReduers = require.context('reducers', false, /\.reducer\.yml$/)
_.forEach(yamlReduers.keys(), fileName => {
    const reducerObj = require(`reducers/${fileName.substring(2)}`)
    reducers[reducerObj.scope] = reducerObj.switches(require('main/util'))
})

reducers.form = formReducer
reducers.routing = routerReducer
export default combineReducers(reducers)
