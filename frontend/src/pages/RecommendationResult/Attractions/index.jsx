import { connect } from 'react-redux'
import { compose, mapProps, withState, withHandlers } from 'recompose'
import _ from 'lodash'
import Slider from 'react-slick'
import DisplayGrid from './DisplayGrid'
import AttractionMap from './AttractionMap'
import { DISPLAY_ATTRACTIONS_PER_PAGE } from 'main/constants'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const dummyAttractions = {
    chosen: [{
        id:1, hawkerCenters:[1],
    },{
        id:2, hawkerCenters:[2]
    }],
    rec: [
        {id:3, hawkerCenters:[1,]},
        {id:4, hawkerCenters:[2,]},
        {id:5, hawkerCenters:[1,]},
        {id:6, hawkerCenters:[2,]},
        {id:7, hawkerCenters:[]},
        {id:8, hawkerCenters:[]},
        {id:9, hawkerCenters:[]},
        {id:10, hawkerCenters:[]},
        {id:11, hawkerCenters:[]},
        {id:12, hawkerCenters:[]},
        {id:13, hawkerCenters:[]},
        {id:14, hawkerCenters:[]},
        {id:15, hawkerCenters:[]},
        {id:16, hawkerCenters:[]},
        {id:17, hawkerCenters:[]},
        {id:18, hawkerCenters:[]},
        {id:19, hawkerCenters:[]},
        {id:20, hawkerCenters:[]},
        {id:21, hawkerCenters:[]},
        {id:22, hawkerCenters:[]},
        {id:23, hawkerCenters:[]},
    ]
}

const leftArrowStyle = {left: '-60px'}
const rightArrowStyle = {right: '-40px'}

const LeftArrow = ({slideCount, currentSlide, ...others}) => (
    <div {...others} style={ leftArrowStyle }>
        <i className="material-icons slick-left-arrow slick-arrow">navigation</i>
    </div>)
const RightArrow = ({slideCount, currentSlide, ...others}) => (
    <a {...others} style={ rightArrowStyle }>
        <i className="material-icons slick-right-arrow slick-arrow">navigation</i>
    </a>)

const sliderSettings = {
    speed: 500,
    fade: true,
    lazyLoad: true,
    infinite: true,
    dots: true,
    autoplay: true,
    autoplaySpeed: 2000,
    adaptiveHeight: true,
    className: 'attractions-slider',
    nextArrow: <RightArrow/>,
    prevArrow: <LeftArrow/>,
}


const enhance = compose(
    connect(state=>({
        attractionFullInfo: state.attractions.attractions,
        attractionImages: state.attractions.attractionImages,
        hawkerCenterFullInfo: state.attractions.hawkerCenters,
    })),
    withState('center', 'setCenter', null),
    withHandlers({
        changeCenter: ({setCenter}) =>
            center=> setCenter(()=>center)
    }),
    mapProps((
        {
        recommendedAttractions:{ chosen, rec},
        // =dummyAttractions,
        ...others})=>({
        chunkedRecommandtions:
            _.chunk(rec, DISPLAY_ATTRACTIONS_PER_PAGE),
        chosen, rec, ...others,
    })),
)

export default enhance(({
    attractionImages, attractionFullInfo,
    chooseExtraAttraction, extraAttractions,
    chosen, chunkedRecommandtions,
    center, changeCenter,
    rec, hawkerCenterFullInfo,
}) => (
    attractionImages==null ? null :
    <div className='result_attractions-wrapper'>
        <Slider {...sliderSettings}
            >
            { chunkedRecommandtions.map(
                (displayAttractions, idx)=>(
                    <div key={idx}>
                        <DisplayGrid
                            changeCenter={changeCenter}
                            chooseExtraAttraction={chooseExtraAttraction}
                            extraAttractions={extraAttractions}
                            gridItems={displayAttractions.map(
                                ({id, hawkerCenters}, idx)=>({
                                    img: attractionImages[id],
                                    title: attractionFullInfo[id].NAME,
                                    attractionID: id,
                                })
                            )}
                        />
                    </div>
                )
            )}
        </Slider>
        <AttractionMap
            center={center}
            recommendations={rec}
            attractionFullInfo={attractionFullInfo}
            userChosenExtraAttractions={extraAttractions}
            chooseExtraAttraction={chooseExtraAttraction}
            hawkerCenterFullInfo={hawkerCenterFullInfo}
        />
    </div>
))
