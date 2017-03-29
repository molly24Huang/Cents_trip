import { Tabs, Tab } from 'material-ui'
import { compose, lifecycle } from 'recompose'
import _ from 'lodash'
import { connect } from 'react-redux'
import Hotel from './Hotel'
import Attractions from './Attractions'
import actions from 'main/actions'

const enhance = compose(
    connect(state=>({
        recommendationResult: state.recommendation.result
    })),

    lifecycle({
        componentWillMount(){
            if(_.isNil(this.props.recommendationResult)){
                actions.replaceHistory({
                    toPath: '/'
                })
            }
        }
    })
)

export default enhance(({
 hotel, attractions
})=>(
    <div className='result-wrapper'>
        <Tabs>
            <Tab label='Hotel'>
                <Hotel hotelInfo={hotel}/>
            </Tab>
            <Tab label='Attractions'>
                <Attractions/>
            </Tab>
        </Tabs>
    </div>
))
