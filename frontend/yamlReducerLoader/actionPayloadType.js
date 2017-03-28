const yaml = require('js-yaml')
const _ = require('lodash')

const predinedVar = ['state', 'action', 'util']

const parseData = data=>{
    if (_.isNil(data)){
        return null
    }
    if (_.isBoolean(data)){
        return `${data}`
    }
    if (_.isString(data)){
        return data.match(new RegExp(`(${predinedVar.join('|')})\.`)) !== null ?
            `${data}` :
            `'${data}'`
    }
    if (_.isArray(data)){

        return '['+(_.map(data, value=>{
            const temp = parseData(value)
            return _.isNil(temp) ? 'null' : temp
        })).join(',') + ']'
    }
}

const Payload = new yaml.Type('!payload', {
    kind: 'mapping',
    construct(data){
        let functionBody = `return {`
        _.forEach(data, (value,key)=>{
            functionBody += `${key}:${
                parseData(value)},`
        })
        functionBody += '}'
        return new Function(['state', 'action', 'util'], functionBody)
    },
})

const schema =  yaml.Schema.create([Payload])
schema.include = [yaml.DEFAULT_FULL_SCHEMA]

module.exports = schema
