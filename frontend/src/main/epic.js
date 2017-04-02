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
        action$ => Observable.fromPromise(requestGet(env.infoURL)()).map(
            res=> {
                if(res.success){
                    const attractionImages = require('./attraction_images.yaml')
                    const {hotels, hawker_centers:hawkerCenters, attractions}=
                        res.data
                    const classfiedAttractions = {}
                    const keys= Object.keys(attractions)
                    keys.forEach(key=>{
                        const attraction = attractions[key]
                        const category = _.get(classfiedAttractions,
                            attraction.CATEGORY, [])
                        category.push(attraction)
                        classfiedAttractions[attraction.CATEGORY] = category
                    })
                    return ({
                        type: 'FETCH_ATTRACTIONS_SUCCEEDED',
                        data: {
                            attractions,
                            hotels,
                            hawkerCenters,
                            classfiedAttractions,
                            attractionImages
                        }
                    })
                }else{
                    return ({
                        type: 'FETCH_ATTRACTIONS_FAILED'
                    })
                }
            }
        )
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
            Observable.fromPromise(requestPost(
                env.recommend, action$.payload)()).mergeMap(
                    res=> res.success ? Observable.concat(
                        Observable.of({
                            type: 'RECOMMENDATION_SUCCEEDED',
                            data: res.data,
                        }),
                        Observable.of({
                            type: 'OPEN_RESULT_MENU'
                        }),
                        Observable.of({
                            type: 'PUSH_HISTORY',
                            toPath: 'result'
                        })
                    ) : Observable.of({
                        type: 'RECOMMENDATION_FAILED',
                    })
                ),
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
