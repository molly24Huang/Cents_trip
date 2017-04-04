import { Tabs, Tab } from 'material-ui'
import { Menu, MainButton, ChildButton } from 'react-mfb'
import { compose, lifecycle, withState, withHandlers } from 'recompose'
import { ModalManager } from 'react-dynamic-modal'
import _ from 'lodash'
import { connect } from 'react-redux'
import SummaryModal from 'components/SummaryModal'
import Hotel from './Hotel'
import Attractions from './Attractions'
import actions from 'main/actions'

import 'react-mfb/mfb.css'

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
            <div onClick={e=>{e.stopPropagation()}}>
                <Menu effect='slidein-spring' position='br' method='hover'>
                    <MainButton
                        iconResting="ion-plus-round"
                        iconActive="ion-close-round"
                        label='More Actions'
                        onClick={e=>{
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                        />
                    <ChildButton
                        icon="ion-happy"
                        label="Summary"
                        onClick={()=>{
                            ModalManager.open(
                                <SummaryModal/>
                            )
                        }}
                     />
            </Menu>
            </div>
        </div>
    )}
)
