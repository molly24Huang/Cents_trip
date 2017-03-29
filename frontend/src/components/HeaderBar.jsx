import { AppBar } from 'material-ui'

export default ({className, toggleSiderMenuHandler})=>
    <AppBar
        onLeftIconButtonTouchTap={toggleSiderMenuHandler}
        className={className}
        title={Config.Text.HeaderBar.label}
        style={{
            position: 'fixed',
            top: 0
        }}
    />
