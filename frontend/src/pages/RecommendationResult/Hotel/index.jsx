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
 import { compose, withState, withHandlers } from 'recompose'
 import ReactTooltip from 'react-tooltip'
 import HotelMap from './HotelMap'

 const dummyHotel = [{
     id: 1,
     name: 'Brand New Apartment Near the City',
     price: 169,
     rating: 5,
     lat: 1.3129895003410064,
     lng: 103.87605899589323,
     img: 'https://a0.muscache.com/im/pictures/62599881/dbefcb51_original.jpg?aki_policy=large',
     roomURL:'https://www.airbnb.com.sg/rooms/4917556',
     hawkerCenter:[{
         name: 'Chomp Chomp Food Centre',
         lat: 1.314268,
         lng: 103.866463
     },{
         name: 'East Coast Lagoon Food Village',
         lat: 1.315147,
         lng: 103.830095
     }]
 },{
     id: 2,
     name: 'Luxurious condo near city centre',
     price: 141,
     rating: 5,
     lat: 1.3148603874454443,
     lng: 103.89437950388881,
     img: 'https://a0.muscache.com/im/pictures/d8fb9e8d-bd64-4b18-91a5-fedc38aec456.jpg?aki_policy=large',
     roomURL:'https://www.airbnb.com.sg/rooms/11088631',
     hawkerCenter:[{
         name: 'Tiong Bahru Market and Food Centre',
         lat: 1.304869,
         lng: 103.832468
     },{
         name: 'The Verge Food Court',
         lat: 1.314782,
         lng: 103.891839
     }]
 }
]

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
            ({id, lat, lng, name, hawkerCenter}) => setHotelMapInfo(pre=>{
                return do {
                    if(_.isNil(pre) || pre.id != id){
                        ({id, lat, lng, name, hawkerCenter})
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
    })
)

export default enhance(({hotelInfo=dummyHotel,
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
                            lat, lng, hawkerCenter
                        }, idx)=>(
                            <TableRow
                                hoverable={true}
                                className='cursor-pointer'
                                onTouchTap={e=>{
                                    if(e.target.tagName!=='TD') return
                                    selectRow(id)
                                    chooseHotel({
                                        id, name, lat, lng, hawkerCenter
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
