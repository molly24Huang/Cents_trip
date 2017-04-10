import _ from 'lodash'
import titlecase from 'titlecase'

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
        this.hawkerCenters = []
    }

    componentDidMount(){
        let map = new google.maps.Map(ReactDOM.findDOMNode(this.googleMapContainer), {
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          center: defaultCenter,
          scrollwheel: false
        })
        this.map = map
        if(this.props.hotelMapInfo != null){
            this.updateHotelMap(this.props.hotelMapInfo)
        }

    }

    updateHotelMap({id, name, lat, lng, hawkerCenters}){
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
            map_icon_label: '<span class="map-icon map-icon-lodging">'+
                                `<span id="marker-icon-hotel-${
                                    id
                                }" class="marker-icon-text map-icon-text display-none pop-box">${
                                    titlecase(name)
                                }</span`+
                            '</span>'
        })
        marker.addListener('mouseover', ()=>{
                const classList = document.getElementById(`marker-icon-hotel-${id}`).classList
                if(classList.contains('display-none'))
                    classList.remove('display-none')
        })
        marker.addListener('mouseout', ()=>{
            const classList = document.getElementById(
                `marker-icon-hotel-${id}`).classList
            if(!classList.contains('display-none'))
                classList.add('display-none')
        })
        this.hotelMarker=marker
        this.hotelID=id
        this.hawkerCenters = hawkerCenters.map(({name, lat, lng})=>
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
        if(_.size(this.hawkerCenters)!=0){
            this.hawkerCenters.forEach(
                hawkerCenter=>hawkerCenter.setMap(null))
            this.hawkerCenters = []
        }
    }

    render(){
        if(!_.isNil(this.map)){
            if(_.isNil(this.props.hotelMapInfo)){
                this.clearHotelMap()
            } else{
                if (this.hotelID != this.props.hotelMapInfo.id){
                    this.clearHotelMap()
                    this.updateHotelMap(this.props.hotelMapInfo)
                }
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
