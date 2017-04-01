import { Tabs, Tab } from 'material-ui'
import { compose, lifecycle, withState, withHandlers } from 'recompose'
import _ from 'lodash'
import { connect } from 'react-redux'
import Hotel from './Hotel'
import Attractions from './Attractions'
import actions from 'main/actions'

const enhance = compose(
    connect(state=>({
        recommendationResult: state.recommendation.result
    })),

    withState('extraAttractions', 'setExtraAttractions', []),
    withHandlers({
        chooseExtraAttraction: ({setExtraAttractions})=>
            attractionID => setExtraAttractions(pre=>{
                return do {
                    if(pre.includes(attractionID)){
                        _.without(pre, attractionID)
                    }else{
                        _.union(pre, [attractionID])
                    }
                }
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
        chooseExtraAttraction, extraAttractions,
        recommendationResult: {
                hotels, attractions
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
        </div>
    )}
)
