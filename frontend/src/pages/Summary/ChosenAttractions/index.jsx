import { Paper, Divider } from 'material-ui'
import { StyleSheet, css }from 'aphrodite'
import titlecase from 'titlecase'
import ReactTooltip from 'react-tooltip'
import Rating from 'components/Rating'

const rawStyle = {
    chosenAttrsDisplay: {
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            maxWidth: '900px',
            maxHeight: '397px',
            overflowY: 'scroll',
    },

    attrText: {
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

const AttrCard = ({name, lat, lng, rating, price, image, delay })=>(
<div style={{
    animation: `zoomInUp ${delay}s both`
}}>
    <Paper className='chosen-attr' zDepth={3}>
        <div className='preview-image'>
            <div className='fg' style={{
                background: `url('${image}')`
            }}/>
            <div className='bg' style={{
                background: `url('https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=250x250&markers=color:0x558B2F|size:mid|${lat},${lng}')`
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

export default ({attrs, fullInfo, images})=>(
    <div className={css(style.chosenAttrsDisplay)} >
        <div className='chosen-attrs-wrapper' style={rawStyle.container}>
            {attrs.map((id, idx)=>{
                const {LATITUDE:lat, LONGITUDE:lng, TICKET_PRICE:price,
                    NAME:name, RATING:rating}
                    = fullInfo[id]
                const image = images[id]
                return (
                    <AttrCard key={idx}
                        {...{lat, lng, price, rating, name, image, delay:idx+1}}
                    />
                )
            })}
        </div>
        <ReactTooltip type='success'/>
    </div>
)
