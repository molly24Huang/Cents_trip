import { Tabs, Tab } from 'material-ui'
import { compose, lifecycle, withState, withHandlers } from 'recompose'
import _ from 'lodash'
import { connect } from 'react-redux'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import Hotel from './Hotel'
import Attractions from './Attractions'
import Summary from 'pages/Summary'
import actions from 'main/actions'

const dummy = {"attractions": {"chosen": [{"id": 24, "hawkerCenters": [20]}, {"id": 13, "hawkerCenters": [85, 83, 124]}], "rec": [{"id": 1, "hawkerCenters": [109, 27, 107]}, {"id": 35, "hawkerCenters": [108, 114, 196]}, {"id": 37, "hawkerCenters": [108, 196, 114]}, {"id": 38, "hawkerCenters": [196, 114, 108]}, {"id": 103, "hawkerCenters": [109, 27, 107]}, {"id": 40, "hawkerCenters": [109, 154, 27]}, {"id": 9, "hawkerCenters": [125, 25, 222]}, {"id": 6, "hawkerCenters": [203, 5, 18]}, {"id": 43, "hawkerCenters": [228, 108, 154]}]}, "hotels": [{"id": 7959059, "hawkerCenters": [20, 7, 118]}, {"id": 17247062, "hawkerCenters": [20, 7]}, {"id": 16680449, "hawkerCenters": [71, 69, 170]}, {"id": 5493930, "hawkerCenters": [199, 140, 204]}, {"id": 5494971, "hawkerCenters": [199, 140, 204]}]}

const enhance = compose(
    connect(state=>({
        recommendationResult: state.recommendation.result,
        recAttractionIDs: state.interested.interestedAttractionIDs,
        openSummary: state.siderMenu.openSummary,
    })),

    withState('extraAttractions', 'setExtraAttractions',(
        {recAttractionIDs})=> recAttractionIDs),
    withHandlers({
        chooseExtraAttraction: ({setExtraAttractions})=>
            attractionID => setExtraAttractions(pre=>{
                const attrIDs = do {
                    if(pre.includes(attractionID)){
                        _.without(pre, attractionID)
                    }else{
                        _.union(pre, [attractionID])
                    }
                }
                actions.chooseInterestedAttractions({
                    attractionIDs: attrIDs
                })
                return attrIDs
            })
        }
    ),
    lifecycle({
        componentWillMount(){
            if(_.size(this.props.recommendationResult)==0){
                actions.replaceHistory({
                    toPath: '/'
                })
            }
        }
    })
)

export default enhance(
    ({
        chooseExtraAttraction, extraAttractions,openSummary,
        recommendationResult: {
                hotels, attractions,
                // hotels=dummy.hotels, attractions=dummy.attractions
            }={}
    })=> {

        if(_.isNil(hotels) || _.isNil(attractions)){
            return null
        }
        return (
        <div className='result-wrapper'>
            <Tabs>
                <Tab label='Hotel'>
                    <Hotel recommendedHotels={hotels}/>
                </Tab>
                <Tab label='Attractions'>
                    <Attractions
                        extraAttractions={extraAttractions}
                        chooseExtraAttraction={chooseExtraAttraction}
                        recommendedAttractions={attractions}
                    />
                </Tab>
            </Tabs>

            <ReactCSSTransitionGroup
                transitionName='summary'
                transitionEnterTimeout={2000}
                transitionLeaveTimeout={1000}
                >
                { openSummary ? <Summary/> : null }
            </ReactCSSTransitionGroup>
        </div>
    )}
)
