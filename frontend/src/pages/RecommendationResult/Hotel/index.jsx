import {
    Subheader,
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
    Chip,
    Avatar,
 } from 'material-ui'
 import LightBulb from 'material-ui/svg-icons/action/lightbulb-outline'
 import LightBox from 'react-images'
 import titlecase from 'titlecase'
 import _ from 'lodash'
 import { compose, withState, withHandlers, withProps } from 'recompose'
 import { connect } from 'react-redux'
 import ReactTooltip from 'react-tooltip'
 import HotelMap from './HotelMap'
 import actions from 'main/actions'


const Text = Config.Text.RecommendationResult

const headers = [
    'Hotel Name',
    'Rating',
    'Price',
    'Preview',
    'More Info'
]

const enhance = compose(
    connect(state=>({
        hotelFullInfo: state.attractions.hotels,
        hawkerCentersFullInfo: state.attractions.hawkerCenters,
        interestedHotelID: state.interested.interestedHotelID,
    })),
    withProps(
        ({hotelFullInfo, hawkerCentersFullInfo, recommendedHotels}) => ({
            hotelInfo: recommendedHotels.map(({id, hawkerCenters})=>({
                ...hotelFullInfo[id],
                hawkerCenters: hawkerCenters.map(id=>hawkerCentersFullInfo[id])
            }))
        })
    ),
    withState('openImageView', 'setOpenImageView', false),
    withState('imageSrc', 'setImageSrc', ''),
    withState('hotelMapInfo', 'setHotelMapInfo', ({interestedHotelID, hotelInfo})=>{
        if (_.isNil(interestedHotelID)) return null
        const { id, name, lat, lng, hawkerCenters } = hotelInfo.filter(({id})=>id==interestedHotelID)[0]
        return { id, name, lat, lng, hawkerCenters }
    }),
    withState('selectedRow', 'setSelectedRow', ({interestedHotelID})=>{
        if(_.isNil(interestedHotelID)) return null
        return interestedHotelID
    }),
    withHandlers({
        showImageView: ({setOpenImageView, setImageSrc}) =>
            (src) => {
                setImageSrc(src)
                setOpenImageView(()=> true)
            },
        closeImageView: ({setOpenImageView, setImageSrc}) =>
            () => {
                setImageSrc('')
                setOpenImageView(()=> false)
            },
        chooseHotel: ({setHotelMapInfo}) =>
            ({id, lat, lng, name, hawkerCenters}) => setHotelMapInfo(pre=>{
                    if(_.isNil(pre) || pre.id != id){
                        actions.chooseInterestedHotel({
                            hotelID: id
                        })
                        return ({id, lat, lng, name, hawkerCenters})
                    }
                    actions.chooseInterestedHotel({
                        hotelID: null
                    })
                    return null
            }),
        selectRow: ({setSelectedRow}) =>
            (rowID) => setSelectedRow(preID=>{
                const newID = do {
                    if(_.isNil(preID)){
                        rowID
                    }else if(preID==rowID){
                        null
                    }else{
                        rowID
                    }
                }

                return newID
            })
    }),

)

export default enhance(({
    hotelInfo,
    showImageView,
    closeImageView,
    openImageView,
    imageSrc,
    hotelMapInfo,
    chooseHotel,
    selectRow,
    selectedRow,
})=>(
    <div>
        <Subheader className='center-text'>{Text.Hotel.label}</Subheader>
        <div className='vertical-flex'>
            <div className='result_hotel_hotels-wrapper'>
                <Table
                    allRowsSelected={false}>
                    <TableHeader
                        adjustForCheckbox={false}
                        displaySelectAll={false}>
                        <TableRow>
                            { headers.map((header, idx)=>(
                                <TableHeaderColumn
                                    className='center-text'
                                    key={idx}
                                >
                                    { header }
                                </TableHeaderColumn>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        displayRowCheckbox={false}
                        >
                        { hotelInfo.map(({
                            id, name, price,
                            rating, img, roomURL,
                            lat, lng, hawkerCenters
                        }, idx)=>(
                            <TableRow
                                hoverable={true}
                                className='cursor-pointer'
                                onTouchTap={e=>{
                                    if(e.target.tagName!=='TD') return
                                    selectRow(id)
                                    chooseHotel({
                                        id, name, lat, lng, hawkerCenters
                                    })
                                }}
                                key={idx}>
                                <TableRowColumn
                                    style={
                                        selectedRow == id ?
                                        { backgroundColor: '#eaeaea' }
                                        : {}
                                    }
                                    className='center-text'
                                    data-tip={titlecase(name)}
                                    >{titlecase(name)}</TableRowColumn>
                                <TableRowColumn
                                    style={
                                        selectedRow == id ?
                                        { backgroundColor: '#eaeaea' }
                                        : {}
                                    }
                                    className='center-text'
                                    >{rating}</TableRowColumn>
                                <TableRowColumn
                                    style={
                                        selectedRow == id ?
                                        { backgroundColor: '#eaeaea' }
                                        : {}
                                    }
                                    className='center-text'
                                    >{price}</TableRowColumn>
                                <TableRowColumn
                                    style={
                                        selectedRow == id ?
                                        { backgroundColor: '#eaeaea' }
                                        : {}
                                    }
                                    className='center-text'>
                                    <img
                                        className='result_hotel_hotels-wrapper_img'
                                        onClick={e=>{
                                            e.stopPropagation()
                                            showImageView(img)
                                        }}
                                        width={50} height={50} src={img}/>
                                </TableRowColumn>
                                <TableRowColumn
                                    style={
                                        selectedRow == id ?
                                        { backgroundColor: '#eaeaea' }
                                        : {}
                                    }
                                    className='center-text'
                                    >
                                    <a target='_blank'
                                        href={roomURL}
                                        data-tip='More Info'
                                        onClick={
                                            e=>e.stopPropagation()
                                        }>
                                        <i className="material-icons">info_outline</i>
                                    </a>
                                </TableRowColumn>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <hr/>
            <div className='result_hotel_map-wrapper'>
                <HotelMap
                    hotelMapInfo={hotelMapInfo}
                />
            </div>
        </div>
        <ReactTooltip
            type='success'
            effect='float'
        />
        <LightBox
            backdropClosesModal={true}
            onClose={()=>closeImageView()}
            images={[{
                src: imageSrc
            }]}
            isOpen={openImageView}
        />
    </div>
))
