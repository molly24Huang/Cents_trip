import { Paper, FlatButton } from 'material-ui'
import { compose, withState, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import _ from 'lodash'
import { StyleSheet, css } from 'aphrodite'
import ChosenAttractions from './ChosenAttractions'
import IntAttractions from './intAttractions'
import IntHotel from './intHotel'
import actions from 'main/actions'

const rawStyle = {
    hightlightText: {
        fontWeight: 'bold',
        color: '#689F38',
    },
    normalText: {
        color: '#43A047',
    },
    summaryWrapper: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        background: 'rgba(99, 165, 102, 0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '@media (max-height: 600px)':{
            alignItems:'flex-start',
        }
    },
    summaryContentWrapper: {
        minWidth: '50%',
        minHeight: '50%',
        display: 'flex',
        borderRadius: '20px',
        flexDirection: 'column',
        paddingBottom: '10px',
        overflow: 'hidden',
        backgroundColor: 'rgba(204, 204, 204, 0.88)',
    },
    options: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
        width: '100%',
    },
    divider: {
        display: 'inline-block',
        borderLeft: '1px solid rgba(83, 175, 104, 0.51)',
        borderRight: '1px solid rgba(83, 175, 104, 0.51)',
        position: 'relative',
        margin: '0 5px',
        height: '36px'
    },
    hrDivider: {
        borderTop: '1px solid rgba(0, 102, 51, 0.71)',
        width: '95%',
        borderBottom: '1px solid rgba(0, 102, 51, 0.71)'
    }
}

const style = StyleSheet.create(rawStyle)

const enhance = compose(
    connect(state=>({
        recommendationResult: state.recommendation.result,
        attractionFullInfo: state.attractions.attractions,
        attractionImages: state.attractions.attractionImages,
        hotelFullInfo: state.attractions.hotels,
        chosenAttractions: state.attractions.chosenAttractions,
        interestedHotelID: state.interested.interestedHotelID,
        interestedAttractionIDs: state.interested.interestedAttractionIDs,
    })),
    withState('summaryType', 'setSummaryType', 'attractions'),
    withHandlers({
        changeType: ({setSummaryType, summaryType}) =>
            newType => (newType != summaryType) && setSummaryType(newType)
    })
)

export default enhance(({
    interestedHotelID, interestedAttractionIDs, changeType, summaryType,
    attractionFullInfo, attractionImages, chosenAttractions, hotelFullInfo
})=>(
    <div
        className={ css(style.summaryWrapper) }
        onClick={e=>actions.openResultMenu()}
    >
        <Paper
            onClick={e=>e.stopPropagation()}
            zDepth={5}
            className={ css(style.summaryContentWrapper)}>
                <div className={ css(style.options) }>
                    <FlatButton
                        labelStyle={
                            summaryType=='attractions' ?
                            rawStyle.hightlightText :
                            rawStyle.normalText
                        }
                        label='Attractions'
                        secondary
                        onTouchTap={e=>(
                            e.stopPropagation(), changeType('attractions'))
                        }
                    />
                    <div className={css(style.divider)}/>
                    <FlatButton
                        labelStyle={
                            summaryType=='intAttractions' ?
                            rawStyle.hightlightText :
                            rawStyle.normalText
                        }
                        label='Interested Attractions'
                        secondary
                        onTouchTap={e=>(
                            e.stopPropagation(), changeType('intAttractions'))
                        }
                    />
                    <div className={css(style.divider)}/>
                    <FlatButton
                        labelStyle={
                            summaryType=='intHotel' ?
                            rawStyle.hightlightText :
                            rawStyle.normalText
                        }
                        label='Interested Hotel'
                        secondary
                        onTouchTap={e=>(
                            e.stopPropagation(), changeType('intHotel'))
                        }
                    />
                </div>
                <hr className={css(style.hrDivider)}/>
                <div>
                    { do {
                            if(summaryType == 'attractions') {
                                <ChosenAttractions
                                    attrs={chosenAttractions.map(x=>x.ATTRACTIONID+'')}
                                    fullInfo={attractionFullInfo}
                                    images={attractionImages}
                                />
                            }else if(summaryType == 'intAttractions'){
                                <IntAttractions
                                    attrs={interestedAttractionIDs}
                                    fullInfo={attractionFullInfo}
                                    images={attractionImages}
                                />
                            }
                            else {
                                <IntHotel
                                    hotelID={interestedHotelID}
                                    fullInfo={hotelFullInfo}
                                />
                            }
                    }}
                </div>
        </Paper>
    </div>
))
