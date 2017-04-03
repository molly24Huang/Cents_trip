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


const Text = Config.Text.RecommendationResult

const headers = [
    'Hotel Name',
    'Rating',
    'Price',
    'Preview',
    'More Info'
]

const enhance = compose(
    withState('openImageView', 'setOpenImageView', false),
    withState('imageSrc', 'setImageSrc', ''),
    withState('hotelMapInfo', 'setHotelMapInfo', null),
    withState('selectedRow', 'setSelectedRow', null),
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
                return do {
                    if(_.isNil(pre) || pre.id != id){
                        ({id, lat, lng, name, hawkerCenters})
                    }else {
                        null
                    }
                }
            }),
        selectRow: ({setSelectedRow}) =>
            (rowID) => setSelectedRow(preID=>{
                return do {
                    if(_.isNil(preID)){
                        rowID
                    }else if(preID==rowID){
                        null
                    }else{
                        rowID
                    }
                }
            })
    }),
    connect(state=>({
        hotelFullInfo: state.attractions.hotels,
        hawkerCentersFullInfo: state.attractions.hawkerCenters,
    })),
    withProps(
        ({hotelFullInfo, hawkerCentersFullInfo, recommendedHotels}) => ({
            hotelInfo: recommendedHotels.map(({id, hawkerCenters})=>({
                ...hotelFullInfo[id],
                hawkerCenters: hawkerCenters.map(id=>hawkerCentersFullInfo[id])
            }))
        })
    )
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
