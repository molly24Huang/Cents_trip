import classnames from 'classnames'
import { connect } from 'react-redux'
import { compose, withState, withHandlers, lifecycle } from 'recompose'
import { Paper } from 'material-ui'
import HeaderBar from 'components/HeaderBar'
import SiderMenu from 'components/SiderMenu'
import Loading from 'components/Loading'
import actions from 'main/actions'


const enhance = compose(
    lifecycle({
        componentDidMount(){
            actions.fetchAttractions()
        }
    }),
    withState('isSiderMenuOpen', 'setSiderMenuStatus', true),
    withHandlers({
        openSiderMenu: ({setSiderMenuStatus}) =>
            () => setSiderMenuStatus(previous=>true),
        closeSiderMenu: ({setSiderMenuStatus}) =>
            () => setSiderMenuStatus(previous=>false),
        toggleSiderMenu: ({setSiderMenuStatus}) =>
            () => setSiderMenuStatus(previous=>!previous)
    }),
    connect((state, router)=>({
        loading: state.attractions.loading,
        currentLocation: router.routes[router.routes.length-1].path || ''
    }))
)

export default enhance(
    ({isSiderMenuOpen, toggleSiderMenu, loading, children,
        currentLocation})=>(
    <div>
        <SiderMenu
            open={isSiderMenuOpen}
            currentLocation={currentLocation}/>
        <div className={
            classnames({'header-bar_with_sider-menu': isSiderMenuOpen})
        }>
            <HeaderBar toggleSiderMenuHandler={toggleSiderMenu}/>
            {
                loading ? <Loading/> : (
                    <div className='main-container'>
                        <Paper
                            zDepth={3}
                            style={{
                                width:'90%',
                                height: '90%',
                                display: 'flex',
                                justifyContent: 'center'
                        }}>
                            { children }
                        </Paper>
                    </div>
                )
            }
        </div>

    </div>
))
