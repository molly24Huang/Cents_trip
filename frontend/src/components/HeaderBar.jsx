import { AppBar } from 'material-ui'
import actions from 'main/actions'

const handler = e=>{
    actions.pushHistory({
        toPath: '/'
    })
    actions.resetToWelcome()
    actions.resetChosenAttractions()
    actions.resetInsterested()
}

export default ({className, toggleSiderMenuHandler})=>
    <AppBar
        onLeftIconButtonTouchTap={toggleSiderMenuHandler}
        className={className}
        title={<span className='cursor-pointer'>{Config.Text.HeaderBar.label}</span>}
        onTitleTouchTap={handler}
        style={{
            position: 'fixed',
            top: 0
        }}
    />
