import _ from 'lodash'
import titlecase from 'titlecase'

const defaultCenter = {
    lat: 1.27,
    lng: 103.85
}

const uncheckedColor = '#69F0AE'
const checkedColor = '#00C853'

export default class AttractionMap extends React.PureComponent {
    constructor(props){
        super(props)
        this.map = null
        this.hawkerCenterMarkers = {}
        this.attractionMarkers = {}
    }

    componentDidMount(){
        let center = defaultCenter
        if(!_.isNil(this.props.recommendations) && !_.isNil(this.props.recommendations[0])){
            const firstAttraction =
                this.props.attractionFullInfo[this.props.recommendations[0].id]
            center = {
                lat: parseFloat(firstAttraction.LATITUDE),
                lng: parseFloat(firstAttraction.LONGITUDE)
            }
        }
        let map = new google.maps.Map(ReactDOM.findDOMNode(
            this.googleMapContainer), {
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          center,
          scrollwheel: false
        })
        this.map = map
        this.drawMap()
    }

    getIconInfo(attractionID, category, name){
        const iconConfig = Config.MarkerIcon[category]
        return {
            icon: Object.assign({}, {
                    fillOpacity: 1,
                    strokeColor: '',
                    strokeWeight: 0
                }, {
                    path: window[iconConfig.iconPath],
                    fillColor:
                        this.props.userChosenExtraAttractions.includes(
                            attractionID) ? checkedColor :
                            uncheckedColor,
                }),
            map_icon_label: `<span class="${iconConfig.iconClass}">`+
                                `<span id="marker-icon-attraction-${
                                    attractionID
                                }" class="marker-icon-text map-icon-text display-none pop-box">${
                                    titlecase(name)
                                }</span></span>`
        }
    }

    drawMap = ()=>{
        const {
            attractionFullInfo, recommendations, userChosenExtraAttractions,
            hawkerCenterFullInfo
        } = this.props

        recommendations.forEach(({id:attractionID, hawkerCenters}, idx)=>{
            const {
                LONGITUDE:lng, LATITUDE:lat, CATEGORY: category, NAME:name
            } = attractionFullInfo[attractionID]
            const marker = new Marker({
                position: new google.maps.LatLng(
                    lat, lng),
                map: this.map,
                animation: google.maps.Animation.DROP,
                ...this.getIconInfo(attractionID, category, name)
            })
            marker.addListener('click', ()=>{
                this.props.chooseExtraAttraction(attractionID)
            })
            marker.addListener('mouseover', ()=>{
                    const classList = document.getElementById(
                        `marker-icon-attraction-${attractionID}`).classList
                    if(classList.contains('display-none'))
                        classList.remove('display-none')
            })
            marker.addListener('mouseout', ()=>{
                const classList = document.getElementById(
                    `marker-icon-attraction-${attractionID}`).classList
                if(!classList.contains('display-none'))
                    classList.add('display-none')
            })
            this.attractionMarkers[attractionID]=marker

            hawkerCenters.forEach((hawkerCenterID, idx)=>{
                if(_.isNil(this.hawkerCenterMarkers[hawkerCenterID])){
                    const { lat,lng } = hawkerCenterFullInfo[hawkerCenterID]
                    const hawkerMarker = new Marker({
                        position: new google.maps.LatLng(lat, lng),
                        map: this.map,
                        icon: '/assets/img/hawker_center_icon.png'
                    })
                    this.hawkerCenterMarkers[hawkerCenterID]=hawkerMarker
                }
            })
        })
    }

    updateMap(){
        const {
            userChosenExtraAttractions, center, attractionFullInfo
        } = this.props
        const keys = Object.keys(this.attractionMarkers)
        _.forEach(keys, (key, idx)=>{
            const marker = this.attractionMarkers[key]
            const icon = marker.getIcon()
            if(userChosenExtraAttractions.includes(parseInt(key)) && icon.fillColor==uncheckedColor){
                icon.fillColor=checkedColor
                marker.setIcon(icon)
            }
            if(!userChosenExtraAttractions.includes(parseInt(key)) && icon.fillColor==checkedColor){
                icon.fillColor=uncheckedColor
                marker.setIcon(icon)
            }
        })
        if(!_.isNil(center)){
            const centerMark = this.attractionMarkers[center]
            this.map.setCenter(centerMark.getPosition())
        }
    }

    render(){
        if(!_.isNil(this.map)){
            this.updateMap()
        }
        return(
            <div className='result_attractions-map-wrapper'>
                <div
                    ref={div=>this.googleMapContainer = div}
                    style={{
                        height: 400,
                        width: 1000,
                    }}
                />
            </div>
        )
    }
}
