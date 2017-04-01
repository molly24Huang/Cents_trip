import { submit, change } from 'redux-form'
import { push, replace } from 'react-router-redux'
import { combineEpics } from 'redux-observable'
import { Observable } from 'rxjs/Observable'
import moment from 'moment'
import "rxjs/add/operator/delay"
import "rxjs/add/operator/map"
import "rxjs/add/operator/mergeMap"
import "rxjs/add/operator/debounceTime"
import "rxjs/add/operator/mapTo"
import "rxjs/add/operator/do"
import "rxjs/add/observable/fromPromise"
import "rxjs/add/observable/of"
import 'rxjs/add/observable/concat'
import _ from 'lodash'
import { requestGet, requestPost } from 'main/apis'
import { goto403 } from 'main/util'

const dummyHotels = [{
    id: 1,
    name: 'Brand New Apartment Near the City',
    price: 169,
    rating: 5,
    lat: 1.3129895003410064,
    lng: 103.87605899589323,
    img: 'https://a0.muscache.com/im/pictures/62599881/dbefcb51_original.jpg?aki_policy=large',
    roomURL:'https://www.airbnb.com.sg/rooms/4917556',
},{
    id: 2,
    name: 'Luxurious condo near city centre',
    price: 141,
    rating: 5,
    lat: 1.3148603874454443,
    lng: 103.89437950388881,
    img: 'https://a0.muscache.com/im/pictures/d8fb9e8d-bd64-4b18-91a5-fedc38aec456.jpg?aki_policy=large',
    roomURL:'https://www.airbnb.com.sg/rooms/11088631',
}]

const dummyHawkerCenters=[{
    id: 1,
    name: 'Tiong Bahru Market and Food Centre',
    lat: 1.304869,
    lng: 103.832468
},{
    id: 2,
    name: 'The Verge Food Court',
    lat: 1.314782,
    lng: 103.891839
},{
    id: 3,
    name: 'Chomp Chomp Food Centre',
    lat: 1.314268,
    lng: 103.866463
},{
    id: 4,
    name: 'East Coast Lagoon Food Village',
    lat: 1.315147,
    lng: 103.830095
}]

const dummyAttractions = require('./TOURISM_ATTRACTIONS.csv')

const dummyAction = { type: 'DUMMY'}

const list2DictWithID = (list, key='id') =>{
    const result = {}
    list.forEach(ele=>result[ele[key]]=ele)
    return result
}

const historyPushEpic = (action$, store)=>
    action$.ofType('PUSH_HISTORY').do(
        action$ => store.dispatch(push(action$.toPath))
    ).mapTo(dummyAction)

const historyReplaceEpic = (action$, store)=>
    action$.ofType('REPLACE_HISTORY').do(
        action$ => store.dispatch(replace(action$.toPath))
    ).mapTo(dummyAction)


const fetchAttractonsEpic = action$ =>
    action$.ofType('FETCH_ATTRACTIONS').mergeMap(
        action$ => {
            /* dummy example*/
            const attractionImages = require('./attraction_images.yaml')
            const attractions = list2DictWithID(dummyAttractions, 'ATTRACTIONID')
            const hotels = list2DictWithID(dummyHotels)
            const hawkerCenters = list2DictWithID(dummyHawkerCenters)
            const classfiedAttractions = {}
            for(const attraction of dummyAttractions){
                const category = _.get(classfiedAttractions,
                    attraction.CATEGORY, [])
                category.push(attraction)
                classfiedAttractions[attraction.CATEGORY] = category
            }
            return (
                Observable.of({
                type: 'FETCH_ATTRACTIONS_SUCCEEDED',
                data: {
                    attractions,
                    hotels,
                    hawkerCenters,
                    classfiedAttractions,
                    attractionImages
                }
                }).delay(1000)
            )
        }
            // Observable.fromPromise(
            //     requestGet(env.fetchAttractionsURL)()).map(
            //         res => (
            //             res.success ?
            //             {
            //                 type: 'FETCH_ATTRACTIONS_SUCCEEDED',
            //                 data: res.data
            //             } : {
            //                 type: 'FETCH_ATTRACTIONS_FAILED',
            //             }
            //         )
            //     )
    )

const triggerFormSubmitEpic = (action$, store) =>
    action$.ofType('TRIGGER_FORM_SUBMIT').do(action$=>
        store.dispatch(submit(action$.formID))).mapTo(dummyAction)

const submitUserInputEpic = (action$, store) =>
    action$.ofType('SUBMIT_USER_INPUT').mergeMap(action$=>{
        const attractions =
            store.getState()['recommendation'].userInputAttractions
        const attractionFullInfo = store.getState()['attractions'].attractions
        const rawPaylayLoad = action$.payload
        const days = moment.duration(
            moment(rawPaylayLoad.endDate).startOf('day').diff(
            moment(rawPaylayLoad.startDate).startOf('day'))
        ).asDays() + 1
        const attra_list = attractions
        const budget = rawPaylayLoad.budget
        const attra_price = attra_list.reduce(
            (acc, attra_id)=> acc +
                parseInt(attractionFullInfo[parseInt(attra_id)].TICKET_PRICE),
            0)
        const payload = {
            attra_list,
            attra_price,
            budget,
            days
        }
        return Observable.of({
            type: 'DO_RECOMMENDATION',
            payload,
        })
    })

const changeFormFieldValueEpic = (action$, store) =>
    action$.ofType('CHANGE_FORM_FIELD_VALUE').map(
        ({form, field, value})=>
            store.dispatch(change(form, field, value))
    )

const chooseAttractionEpic = (action$,store) =>
    action$.ofType('CHOOSE_ATTRACTION').map(
        ({ATTRACTIONID, ...extra}) => {
            let alreadyChosenAttractions =
                store.getState()['attractions'].chosenAttractions
            let others = alreadyChosenAttractions.filter(
                ({ATTRACTIONID: id})=> id != ATTRACTIONID)
            let newChoosenAttractions =
                    others.length != alreadyChosenAttractions.length ?
                        others : [...others, {ATTRACTIONID, ...extra}]
            return ({
                type: 'SET_CHOSEN_ATTRACTION',
                chosenAttractions: newChoosenAttractions
            })
        }
    )
const doRecommendationEpic = action$ =>
    action$.ofType('DO_RECOMMENDATION').mergeMap(
        action$ =>
            Observable.concat(
                Observable.fromPromise(requestGet(
                    `${env.backendURL}${env.recomend}`, payload)()).map(
                        res=> res.success ? Observable.of({
                            type: 'RECOMMENDATION_SUCCEEDED',
                            data: res.data,
                        }) : Observable.of({
                            type: 'RECOMMENDATION_FAILED',
                        })
                    ),
                // Observable.of({
                //     type: 'RECOMMENDATION_SUCCEEDED',
                //     data: {
                //         hotels: [
                //                 {id:1, hawkerCenters:[3,4]},
                //                 {id:2, hawkerCenters:[1,2]}
                //             ],
                //         attractions: {
                //             chosen: [{
                //                 id:1, hawkerCenters:[1],
                //             },{
                //                 id:2, hawkerCenters:[2]
                //             }],
                //             rec: [
                //                 {id:3, hawkerCenters:[1]},
                //                 {id:4, hawkerCenters:[2]},
                //                 {id:5, hawkerCenters:[1]},
                //                 {id:6, hawkerCenters:[2]},
                //                 {id:8, hawkerCenters:[]},
                //                 {id:9, hawkerCenters:[]},
                //                 {id:10, hawkerCenters:[]},
                //                 {id:11, hawkerCenters:[]},
                //                 {id:12, hawkerCenters:[]},
                //                 {id:13, hawkerCenters:[]},
                //             ]
                //         }
                //     }
                // }),
                Observable.of({
                    type: 'OPEN_RESULT_MENU'
                }),
                Observable.of({
                    type: 'PUSH_HISTORY',
                    toPath: 'result'
                })
            )
            // .delay(5000)
    )


export default combineEpics(
    fetchAttractonsEpic,
    historyPushEpic,
    historyReplaceEpic,
    triggerFormSubmitEpic,
    submitUserInputEpic,
    changeFormFieldValueEpic,
    chooseAttractionEpic,
    doRecommendationEpic,
)
