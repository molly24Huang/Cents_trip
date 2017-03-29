const yaml = require('js-yaml')
const SCHEMA = require('./actionPayloadType')
const _ = require('lodash')
const transform = require('babel-core').transform

const constrcutReducerFunc = ({init, switches={}}) => {
    const switchStatement = []
    _.forEach(switches, (value,key)=>{
        let str = `case '${key}': return Object.assign({}, state,${
            _.isFunction(value) ?
                `(${value})(state, action, util)` :
                JSON.stringify(value)
            })`

        switchStatement.push(str)
    })
    let reducerContent =
        `var state = state || JSON.parse('${JSON.stringify(init)}');`+ '\n'+
        `switch(action.type){`+'\n'+
            `${switchStatement.join('\n')}`+'\n'+
            `default:`+
                ` return JSON.parse(JSON.stringify(state))
        }`

    return new Function(['util'],
        `return function(state,action){${reducerContent}}`)
}

const replaceImportToCommonJS = code => {
    let regexp = /\n*\s*import\s+([_$\w]+)\s+from\s+('[-_$\w\/]+');/g
    let res = code.split(regexp).filter(x=>x.length>0)
    let returnedFunc = res[res.length-1]
    let requireState = ''
    for(let index=0;index<res.length-1;){
        requireState += `var ${res[index]} = require(${res[index+1]}).default;\n`
        index++
        index++
    }
    let splitedReturnedFunc = returnedFunc.split('return')
    splitedReturnedFunc[0]+=`\n${requireState}`
    return splitedReturnedFunc.join('return')
}

module.exports = function(source){
    this.cacheable()
    const ret = {}
    const reducerObj = yaml.load(source, {schema: SCHEMA})
    ret['scope'] = reducerObj.scope
    ret['actions'] = Object.keys(reducerObj.switches)
    let transformCode = transform(constrcutReducerFunc(reducerObj), {
        extends: `${__dirname}/../.babelrc`,
    }).code
    ret['switches'] = replaceImportToCommonJS(transformCode)
    return `module.exports={
        scope: '${ret.scope}',
        actions: [${ret.actions.map(action=>`'${action}'`)}],
        switches: ${ret.switches.toString()}
    }`
}
