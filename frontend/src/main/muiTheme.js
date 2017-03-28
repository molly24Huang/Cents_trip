import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {
    greenA700,
    green500,
    teal700
 } from 'material-ui/styles/colors'

const muiTheme = getMuiTheme({
    fontFamily: 'DING',
    palette: {
        primary1Color: green500,
        primary2Color: greenA700,
        accent1Color: teal700,
    }

})

export default muiTheme
