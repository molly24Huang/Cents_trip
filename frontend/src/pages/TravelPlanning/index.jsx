import {
    Stepper,
    Step,
    StepButton,
    StepLabel,
    StepContent,
    MenuItem,
} from 'material-ui'
import { reduxForm, Field, getFormValues,  } from 'redux-form'
import { compose, withState, withHandlers, defaultProps } from 'recompose'
import {
    TextField,
    SelectField,
    DatePicker
} from 'redux-form-material-ui'
import { connect } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'
import Loading from 'components/Loading'
import { NextStepButton, BackStepButton, FinishButton } from 'components/StepButton'
import AttractionsPicker from './AttractionsPicker'
import actions from 'main/actions'
import { MAX_TRIP_DURATION_DAYS, formID } from 'main/constants'

const Text = Config.Text
const maxStep = 2
const enhance = compose(
    withState('stepIndex', 'setStepIndex', 0),
    withState('duration', 'setDuration', 1),
    withHandlers({
        nextStep: ({setStepIndex}) =>
            () => setStepIndex(pre=> {

                const nextStepVal = pre<maxStep ? pre+1: pre
                if(nextStepVal == 2) {
                    actions.openAttractionMenu()
                }
                return nextStepVal
            }),
        beforeStep: ({setStepIndex}) =>
            () => setStepIndex(pre=> {
                actions.closeAttractionMenu()
                return pre>0 ? pre-1: pre
            }),
        setStep: ({setStepIndex}) =>
            (index) => setStepIndex(pre => index),
        changeDuration: ({setDuration}) =>
            (duration) => setDuration(pre => duration)
    }),
    defaultProps({
        initialValues: {
            startDate: new Date(),
            endDate: new Date(),
            budget: 0,
            // peopleNum: 1,
        },
    }),
    reduxForm({
        form: formID,
        onSubmit: values=> actions.submitUserInput({payload: values}),
    }),
    connect(state=>({
        startDate: getFormValues(formID)(state).startDate,
        endDate: getFormValues(formID)(state).endDate,
        chosenAttractions: state.attractions.chosenAttractions,
        recommending: state.recommendation.recommending,
    }))
)

export default enhance(({
    nextStep, beforeStep, setStep, stepIndex,
    toggleAttraction, startDate, endDate,
    chosenAttractions, recommending, changeDuration,
    duration,
})=>(
    recommending ?
        <Loading/> :
        (<div>
            <div style={{
                maxWidth: 280,
                margin: 'auto',
                paddingTop: '20px',
                paddingBottom: '20px',
            }}>
                <Stepper
                    activeStep={stepIndex}
                    orientation='vertical'
                    >
                    <Step active={stepIndex==0}>
                        <StepButton onClick={e=>{
                            actions.closeAttractionMenu()
                            setStep(0)
                        }}>
                            <StepLabel>{ Text.TravelPlanning.Step1.label}</StepLabel>
                        </StepButton>
                        <StepContent>
                            <div className='step-container-wrapper'>
                                { Text.TravelPlanning.Step1.content}
                                <Field
                                    component={TextField}
                                    name='budget'
                                    floatingLabelText={
                                        Text.TravelPlanning.Step1.budgetHint}
                                />
                                <NextStepButton
                                    onTouchTap={ e=> nextStep()}
                                    label = 'Next'
                                    primary={true}
                                    className= 'travel-planning-next-button'
                                />
                            </div>
                        </StepContent>
                    </Step>
                    <Step active={stepIndex==1}>
                        <StepButton onClick={e=> {
                            actions.closeAttractionMenu()
                            setStep(1)
                        }}>
                            <StepLabel>{ Text.TravelPlanning.Step2.label}</StepLabel>
                        </StepButton>
                        <StepContent>
                            <div className='step-container-wrapper'>
                            { Text.TravelPlanning.Step2.content}
                            <Field
                                component={DatePicker}
                                name='startDate'
                                autoOk={true}
                                floatingLabelText={
                                    Text.TravelPlanning.Step2.startDate.label}
                                onChange={(n, date)=> {
                                    actions.changeFormFieldValue({
                                        form: formID,
                                        field: 'endDate',
                                        value: date,
                                    })
                                    actions.resetChosenAttractions()
                                }}
                                container="inline"
                            />
                            <Field
                                component={DatePicker}
                                name='endDate'
                                autoOk={true}
                                shouldDisableDate = {
                                    date=>{
                                        const diff = moment(date).diff(
                                            moment(startDate),
                                            'days')
                                        return diff<0 || diff >= MAX_TRIP_DURATION_DAYS
                                    }
                                }
                                floatingLabelText={Text.TravelPlanning.Step2.endDate.label}
                                container="inline"
                                onChange={e=>actions.resetChosenAttractions()}
                            />
                            <BackStepButton
                                onTouchTap={e=> beforeStep()}
                                label= 'Back'
                                secondary= {true}
                                className= 'travel-planning-back-button'
                            />
                            <NextStepButton
                                onTouchTap={e=> {
                                    changeDuration(
                                        moment.duration(
                                            moment(endDate).startOf('day').diff(
                                            moment(startDate).startOf('day'))
                                        ).asDays() + 1)

                                    nextStep()
                                }}
                                label= 'Next'
                                primary= {true}
                                className= 'travel-planning-next-button'
                            />
                        </div>
                        </StepContent>
                    </Step>
                    <Step active={stepIndex==2}>
                        <StepLabel>
                            {Text.TravelPlanning.Step3.label}
                        </StepLabel>
                        <StepContent>
                            <div className='step-container-wrapper'>
                                <BackStepButton
                                    onTouchTap={e=> beforeStep()}
                                    label= 'Back'
                                    secondary= {true}
                                    className= 'travel-planning-back-button'
                                />
                                <FinishButton
                                    label= 'Finish'
                                    primary={ true }
                                    className= 'travel-planning-finish-button'
                                    onTouchTap= { e=> {
                                        e.preventDefault()
                                        actions.triggerFormSubmit({
                                            formID,
                                            attractions:
                                                chosenAttractions.map(
                                                    attraction=>attraction.ATTRACTIONID),
                                    })}}
                                />
                            </div>
                        </StepContent>
                    </Step>
                </Stepper>

            </div>

            { stepIndex == 2 && (
                <div>
                    <div style={{marginBottom:'5px'}} className='center-text'>
                        <span className='choosing-attractions_warnning'>
                            { `${duration * 2 - chosenAttractions.length} attractions can be selected`}
                        </span>
                    </div>
                    <div style={{
                        display: 'flex',
                        marginBottom: 20,
                    }}>
                        <AttractionsPicker
                            chosenAttractions={chosenAttractions}/>
                    </div>
                </div>
            ) }
        </div>)
))
