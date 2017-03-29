import { submit, change } from 'redux-form'
import { push, replace } from 'react-router-redux'
import { combineEpics } from 'redux-observable'
import { Observable } from 'rxjs/Observable'
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

const dummyAction = { type: 'DUMMY'}

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
            const csvRawData = require('./TOURISM_ATTRACTIONS.csv')
            const classfiedData = {}
            for(const attraction of csvRawData){
                const category = _.get(classfiedData, attraction.CATEGORY, [])
                category.push(attraction)
                classfiedData[attraction.CATEGORY] = category
            }
            return (
                Observable.of({
                type: 'FETCH_ATTRACTIONS_SUCCEEDED',
                data: classfiedData
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
    action$.ofType('SUBMIT_USER_INPUT').do(action$=>{
        const attractions =
            store.getState()['recommendation'].userInputAttractions
        const payload = Object.assign({}, action$.payload,{ attractions })
        console.log(payload)
    }).mapTo({
        type: 'DO_RECOMMENDATION'
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
                Observable.of({
                    type: 'RECOMMENDATION_SUCCEEDED',
                    data: {
                        hotel: dummyHotel,
                        attractions: {
                            chosen: [],
                            recommendation: []
                        }
                    }
                }),
                Observable.of({
                    type: 'OPEN_RESULT_MENU'
                }),
                Observable.of({
                    type: 'PUSH_HISTORY',
                    toPath: 'result'
                })
            ).delay(5000)
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
