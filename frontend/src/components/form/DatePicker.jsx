import { DatePicker } from 'material-ui'

export default ({
    input: {
        onBlur,
        ...inputProps
    },
    onChange=Function.prototype,
    meta,
    ...others
}) =>
    <DatePicker
        {...others}
        onChange={ (event, value)=>{
            console.log(inputProps)
            inputProps.onChange(value)
            onChange(value)
        }}
    />
