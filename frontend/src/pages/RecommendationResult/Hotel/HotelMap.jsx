import _ from 'lodash'

const defaultCenter = {
    lat: 1.27,
    lng: 103.85
}

export default class HotelMap extends React.Component {
    constructor(props){
        super(props)
        this.map = null
        this.hotelMarker = null
        this.hotelID = null
        this.hawkerCenter = []
    }

    componentDidMount(){
        let map = new google.maps.Map(ReactDOM.findDOMNode(this.googleMapContainer), {
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          center: defaultCenter,
          scrollwheel: false
        })
        this.map = map
    }

    updateHotelMap({id, name, lat, lng, hawkerCenter}){
        const marker = new Marker({
            position: new google.maps.LatLng(
                lat, lng),
            map: this.map,
            animation: google.maps.Animation.DROP,
            icon: {
                fillOpacity: 1,
                strokeColor: '',
                strokeWeight: 0,
                path: ROUTE,
                fillColor: '#69F0AE'
            },
            map_icon_label: '<span class="map-icon map-icon-lodging"></span>'
        })
        this.hotelMarker=marker
        this.hotelID=id
        this.hawkerCenter = hawkerCenter.map(({name, lat, lng})=>
            new Marker({
                position: new google.maps.LatLng(lat, lng),
                map: this.map,
                icon: '/assets/img/hawker_center_icon.png'
            })
        )
        this.map.setCenter(marker.getPosition())
    }

    clearHotelMap(){
        if(!_.isNil(this.hotelMarker)){
            this.hotelMarker.setMap(null)
            this.hotelMarker=null
            this.hotelID=null
        }
        if(_.size(this.hawkerCenter)!=0){
            this.hawkerCenter.forEach(
                hawkerCenter=>hawkerCenter.setMap(null))
            this.hawkerCenter = []
        }
    }

    render(){
        if(_.isNil(this.props.hotelMapInfo)){
            this.clearHotelMap()
        } else{
            if (this.hotelID != this.props.hotelMapInfo.id){
                this.clearHotelMap()
                this.updateHotelMap(this.props.hotelMapInfo)
            }
        }

        return (
            <div>
                <div
                    ref={div=>this.googleMapContainer = div}
                    style={{
                        height: 400,
                    }}
                />
            </div>
        )
    }
}
