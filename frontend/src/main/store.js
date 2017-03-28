import {createStore, combineReducers, applyMiddleware} from 'redux'
import { routerMiddleware } from 'react-router-redux'
import { createEpicMiddleware } from 'redux-observable'
import { browserHistory } from 'react-router'
import reducer from './reducer'
import epic from './epic'

const epicMiddleware = createEpicMiddleware(epic)
const reactRouterReduxMiddleware = routerMiddleware(browserHistory)
const composeEnhancers = ~['dev'].indexOf(env.ENV)!=0 ?
    require('redux-devtools-extension').composeWithDevTools :
    require('redux').compose
const store = createStore(reducer,
    composeEnhancers(
        applyMiddleware(epicMiddleware),
        applyMiddleware(reactRouterReduxMiddleware)
    ));

export default store;
