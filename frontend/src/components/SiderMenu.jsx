import {
    Drawer,
    MenuItem,
    Menu,
    List,
    ListItem,
    makeSelectable
 } from 'material-ui'
import { green700, lightGreen700, grey200, grey500 } from 'material-ui/styles/colors'
import classnames from 'classnames'
import Place from 'material-ui/svg-icons/maps/place'
import Today from 'material-ui/svg-icons/action/today'
import CloudDone from 'material-ui/svg-icons/file/cloud-done'
import RightArrow from 'material-ui/svg-icons/navigation/chevron-right'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { compose, withState, withHandlers, shouldUpdate, withProps } from 'recompose'
import { connect } from 'react-redux'
import { formValueSelector } from 'redux-form'
import _ from 'lodash'
import titlecase from 'titlecase'
import moment from 'moment'
import { formID } from 'main/constants'
import SuperSelectField from 'components/SuperSelectField'
import actions from 'main/actions'

const SelectableList = makeSelectable(List)

const formSelector = formValueSelector(formID)

const dataSourceNodes = dataSource=> _.map(dataSource,
        ({ATTRACTIONID, NAME}, idx) => (
  <div key={idx} value={ATTRACTIONID} label={NAME} >{titlecase(NAME)}</div>
))

let tempSelectedAttractionsIDKeeper = {}

const constructCategoryMenu = (
    drawOpen,
    attractions, chosenAttractions, maxSelectableCount
) =>
    Config.SiderMenu.order.map((category, idx)=>(
        <SuperSelectField key={idx}
            drawOpen={drawOpen}
            preSelectedItems= {chosenAttractions.filter(
                chosenAttracton=>
                    chosenAttracton.CATEGORY==category).map(
                        attraction=>({
                            value: attraction.ATTRACTIONID,
                            label: attraction.NAME})
                        )}
            onItemSelected={({value, label})=>{
                console.log(value,label)
                if(_.has(tempSelectedAttractionsIDKeeper, value)){
                    delete tempSelectedAttractionsIDKeeper[value]
                }else{
                    tempSelectedAttractionsIDKeeper[value] = true
                }
                actions.chooseAttraction(
                    _.find(attractions[category], {ATTRACTIONID: value})
                )
            }}
            name={category}
            showAutocompleteThreshold={2}
            multiple={true}
            checkPosition='left'
            anchorOrigin={{vertical: 'top', horizontal: 'left'}}
            value={[]}
            elementHeight={
                ['nature-wildlife', 'places-to-see'].includes(category) ?
                    35 : 45
                }
            hintText={Config.SiderMenu.shownText[category]}
            style={{
                marginTop:20, marginLeft:30, marginRight:30,
                color: green700,
            }}
            selectionsRenderer={(value,hintText)=> hintText}
            hoverColor={
                'rgba(118, 255, 3, 0.2)'
            }
            disableCallback={
                ()=>_.size(tempSelectedAttractionsIDKeeper)>=maxSelectableCount
            }
        >
            {dataSourceNodes(attractions[category])}
        </SuperSelectField>
    ))

const SiderMenuHeader = ({style}) => (
    <div
        style={style}
        className='sider-menu_header'
    />
)

const menuAction = (currentVal, nextVal, changeMenu, pushHistory=false) => {
    if(currentVal!=nextVal){
        changeMenu(nextVal)
        pushHistory && actions.pushHistory({
            toPath: `/${nextVal}`
        })
    }
}

const enhance = compose(
    muiThemeable(),
    withState('menuValue', 'setMenuValue', null),
    withHandlers({
        changeMenu: ({setMenuValue}) =>
            nextValue=>setMenuValue(currentValue=>nextValue)
    }),
    connect(state=>({
        openAttraction: state.siderMenu.openAttraction,
        openTravelPlanning: state.siderMenu.openTravelPlanning,
        openResult: state.siderMenu.openResult,
        classfiedAttractions: state.attractions.classfiedAttractions,
        choosenAttractions: state.attractions.chosenAttractions,
        ...formSelector(state, 'startDate', 'endDate')
    })),
    withProps(({startDate, endDate}) => ({
        maxSelectableCount: (
            moment.duration(
                moment(endDate).startOf('day').diff(
                    moment(startDate).startOf('day'))
                ).asDays() + 1) * 2
    })),
    shouldUpdate((prop, nextProp)=>{
        if(prop.startDate!=nextProp.startDate ||
                prop.endDate !=nextProp.endDate){
            tempSelectedAttractionsIDKeeper = {}
        }
        if(prop.open != nextProp.open) return true
        if(prop.menuValue !== nextProp.menuValue) {
            tempSelectedAttractionsIDKeeper = {}
            return true
        }
        if(_.isNil(prop.attraction) && !_.isNil(nextProp.attraction)){
            tempSelectedAttractionsIDKeeper = {}
            return true
        }
        if( prop.openAttraction == nextProp.openAttraction &&
            prop.openTravelPlanning == nextProp.openTravelPlanning &&
            prop.openResult == nextProp.openResult
        ) return false
        return true
    }),
)

export default enhance(({
    open, currentLocation,
    menuValue, changeMenu,
    muiTheme, classfiedAttractions,
    openTravelPlanning,
    openAttraction,
    choosenAttractions,
    openResult, maxSelectableCount,
    ...others })=> {
    const currentMenuValue = do {
            if(openAttraction){
                'attractions'
            }else if(openResult){
                'recommendationResult'
            }else {
                menuValue || currentLocation
            }
        }
    return(
        <Drawer open={open} containerClassName='sider-menu'>
            <SiderMenuHeader style={{
                backgroundColor: muiTheme.palette.primary1Color
            }}/>
            <div className='sider-menu_menus'>
                <SelectableList value={currentMenuValue}>
                    <ListItem
                        hoverColor={'rgba(118, 255, 3, 0.2)'}
                        rightIcon={
                            <Today
                                color={
                                    currentMenuValue == 'travel-planning' ?
                                    lightGreen700: ''
                                }/>}
                        className={classnames('sider-menu_menu', {
                            'sider-menu_disabled': !openTravelPlanning,
                        })}
                        disabled={!openTravelPlanning}
                        value='travel-planning'
                        innerDivStyle={{fontWeight:'bold'}}
                        onTouchTap={e=>
                            menuAction(currentMenuValue,
                                'travel-planning',
                                changeMenu,
                                true)
                        }
                        style={
                            !openTravelPlanning ? { color: grey500 } :
                                currentMenuValue == 'travel-planning' ?
                            { color: lightGreen700, background: grey200 } :
                            {}}
                        primaryText={Config.Text.SiderMenu.menus[0]}
                    />
                    <ListItem
                        hoverColor={'rgba(118, 255, 3, 0.2)'}
                        rightIcon={
                            <Place
                                color={
                                    currentMenuValue == 'attractions' ?
                                    lightGreen700: ''
                                }/>}
                        value='attractions'
                        innerDivStyle={{fontWeight:'bold'}}
                        onNestedListToggle={e=>
                            menuAction(currentMenuValue,
                                'attractions',
                                changeMenu)
                        }
                        className={
                            classnames({
                                'sider-menu_disabled': !openAttraction,
                            }, 'sider-menu_menu')}
                        disabled={!openAttraction}
                        open = { currentMenuValue == 'attractions' }
                        style={currentMenuValue == 'attractions' ?
                            { color: lightGreen700, background: grey200 } :
                            { color: grey500,}}
                        primaryTogglesNestedList
                        primaryText={Config.Text.SiderMenu.menus[1]}
                        nestedItems={
                            _.isNil(classfiedAttractions) ? [] :
                                constructCategoryMenu(
                                    open,
                                    classfiedAttractions,
                                    choosenAttractions,
                                    maxSelectableCount
                                )
                        }
                    />
                    <ListItem
                        hoverColor={'rgba(118, 255, 3, 0.2)'}
                        rightIcon={
                            <CloudDone
                                color={
                                    currentMenuValue == 'recommendationResult' ?
                                    lightGreen700: ''
                                }/>}
                        className={classnames('sider-menu_menu', {
                            'sider-menu_disabled': !openResult,
                        })}
                        disabled={!openResult}
                        value='recommendationResult'
                        innerDivStyle={{fontWeight:'bold'}}
                        style={
                            !openResult ? { color: grey500 } :
                                currentMenuValue == 'recommendationResult' ?
                            { color: lightGreen700, background: grey200 } :
                            {}}
                        primaryText={Config.Text.SiderMenu.menus[2]}
                    />
                </SelectableList>
            </div>
        </Drawer>
    )
})
