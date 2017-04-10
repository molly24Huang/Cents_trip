import { Paper, Divider } from 'material-ui'
import { StyleSheet, css }from 'aphrodite'
import titlecase from 'titlecase'
import ReactTooltip from 'react-tooltip'
import Rating from 'components/Rating'

const rawStyle = {
    'chosenAttrsDisplay': {
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            maxWidth: '900px',
            maxHeight: '600px',
            overflowY: 'scroll',
    },

    'attrText': {
        color: '#006633',
        textAlign: 'center',
        width: '250px',
        marginTop: '5px',
        marginBottom: '5px'
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    }
}

const style = StyleSheet.create(rawStyle)

const HotelCard = ({name, lat, lng, rating, price, image})=>(
    <div style={{
        animation: `flipInX 1s both`,
        'backfaceVisibility': `visible !important`
    }}>
    <Paper className='chosen-attr' zDepth={3}>
        <div className='preview-image'>
            <div className='fg' style={{
                background: `url('${image}')`
            }}/>
            <div className='bg' style={{
                background: `url('https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=12&size=250x250&markers=color:0x558B2F|size:mid|${lat},${lng}')`
            }}/>
        </div>
        <Divider style={{marginTop: '5px', marginBottom: '5px'}}/>
        <div>
            <div className={css(style.attrText)}>{titlecase(name)}</div>
            <div className={css(style.attrText)}>
                Price: {price == 0 ? 'Free' : `${price}$`}
            </div>
            <div data-tip={rating}>
                <Rating ratingValue={+rating} />
            </div>
        </div>
    </Paper>
    </div>
)

export default ({hotelID, fullInfo})=>{
    if(hotelID == null) return null
    const { lat, lng, price, name, rating, img: image } = fullInfo[hotelID]
    return (
        <div className='hotel'>
            <div className={css(style.chosenAttrsDisplay)} >
                <div
                    style={rawStyle.container}
                    >
                        <HotelCard
                            {...{ lat, lng, price, rating, name, image }}
                        />
                </div>
                <ReactTooltip type='success'/>
            </div>
        </div>
    )
}
