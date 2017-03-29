import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { actionCreator } from 'main/util'
import toCamelCase  from 'camelcase'
import store from './store'

let actions = []
const yamlReduers = require.context('reducers', false, /\.reducer\.yml/)
_.forEach(yamlReduers.keys(), fileName => {
    const reducerObj = require(`reducers/${fileName.substring(2)}`)
    actions = [...actions, ...reducerObj.actions]
})

const dispathActions = {};
for (const action of actions) {
  const camelCaseAction = toCamelCase(action);
  dispathActions[camelCaseAction] = actionCreator(action);
}


export default bindActionCreators(dispathActions, store.dispatch);
