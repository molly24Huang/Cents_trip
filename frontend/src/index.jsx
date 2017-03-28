import App from 'main/routes'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'
import muiTheme from 'main/muiTheme'

injectTapEventPlugin();
ReactDOM.render(
    <MuiThemeProvider muiTheme={muiTheme}>
        <App />
    </MuiThemeProvider>,
    document.getElementById('root'));
