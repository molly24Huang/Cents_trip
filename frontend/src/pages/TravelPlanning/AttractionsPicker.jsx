import _ from 'lodash'
import titlecase from 'titlecase'
import ChosenAttractions from './ChosenAttractions'

const defaultCenter = {
    lat: 1.27,
    lng: 103.85
}

class AttractionsPicker extends React.Component {

    constructor(props){
        super(props)
        this.map = null
        this.markers = {}
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

    getIconInfo(attraction){
        const iconConfig = _.get(Config.MarkerIcon.spe, attraction.ATTRACTIONID,
            Config.MarkerIcon[attraction.CATEGORY] )
        return {
            icon: Object.assign({}, {
                    fillOpacity: 1,
                    strokeColor: '',
                    strokeWeight: 0
                }, {
                    path: window[iconConfig.iconPath],
                    fillColor: iconConfig.iconPathColor,
                }),
            map_icon_label: `<span class="${iconConfig.iconClass}">`+
                                `<span id="marker-icon-${
                                    attraction.ATTRACTIONID
                                }" class="marker-icon-text map-icon-text display-none pop-box">${
                                    titlecase(attraction.NAME)
                                }</span></span>`
        }
    }

    componentWillUnmount(){
        const keys = Object.keys(this.markers)
        _.foreach(keys, (_key,key)=>{
            const marker = this.markers[_key]
            marker.setMap(null)
            delete this.markers[key]
        })
    }

    updateMarker(){
        const userCurrentChosenMarkers = this.props.chosenAttractions
        const markersOnMap = this.markers
        const chosenMarkersLen = userCurrentChosenMarkers.length
        const markersOnMapLen = _.size(markersOnMap)
        if (chosenMarkersLen == markersOnMapLen) return
        if (chosenMarkersLen > markersOnMapLen) {
            const addedMarkers = userCurrentChosenMarkers.filter(
                ({ATTRACTIONID})=>_.isNil(markersOnMap[ATTRACTIONID]))
            addedMarkers.forEach(addedMarker=>{
                const { iconPath, iconClass, iconPathColor } =
                    Config.MarkerIcon[addedMarker.CATEGORY]
                const marker = new Marker({
                    position: new google.maps.LatLng(
                        addedMarker.LATITUDE, addedMarker.LONGITUDE),
                    map: this.map,
                    animation: google.maps.Animation.DROP,
                    ...this.getIconInfo(addedMarker)
                })
                marker.addListener('mouseover', ()=>{
                        const classList = document.getElementById(`marker-icon-${addedMarker.ATTRACTIONID}`).classList
                        if(classList.contains('display-none'))
                            classList.remove('display-none')
                })
                marker.addListener('click', ()=>{
                    if (this.map.getZoom()==14){
                        this.map.setZoom(16)
                    }else{
                        this.map.setZoom(14)
                    }
                })
                marker.addListener('mouseout', ()=>{
                    const classList = document.getElementById(`marker-icon-${addedMarker.ATTRACTIONID}`).classList
                    if(!classList.contains('display-none'))
                        classList.add('display-none')
                })
                this.map.setCenter(marker.getPosition())
                markersOnMap[addedMarker.ATTRACTIONID] = marker
            })
        }else{
            const removedMarkerID = Object.keys(markersOnMap).filter(
                (id)=>~_.findIndex(userCurrentChosenMarkers, attraction => attraction.ATTRACTIONID==id)==0)[0]
            markersOnMap[removedMarkerID].setMap(null)
            delete markersOnMap[removedMarkerID]
        }
    }

    render(){
        if(!_.isNil(this.map)){
            this.updateMarker()
        }
        return (
            <div style={{display: 'flex'}}>
                <div
                    ref={div=>this.googleMapContainer = div}
                    style={{
                        height: 400,
                        width: 800,
                    }}
                />
                <ChosenAttractions
                    chosenAttractions={this.props.chosenAttractions}
                    markers={this.markers}
                    map={this.map}
                />
            </div>
        )
    }
}


export default AttractionsPicker
