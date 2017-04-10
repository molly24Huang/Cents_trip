import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import store from './store'
import Skeleton from 'pages/Skeleton'
import Index from 'pages/Index'
import NotFound from 'pages/404'
import TravelPlanning from 'pages/TravelPlanning'
import RecommendationResult from 'pages/RecommendationResult'
// import Summary from 'pages/Summary'

import Manually from 'pages/we_'
import Auto from 'pages/we__'


const history = syncHistoryWithStore(browserHistory, store)
const App = () => (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={Skeleton}>
                <IndexRoute component={Index}/>
                <Route path='travel-planning' component={TravelPlanning} />
                <Route path='result'
                    component={RecommendationResult}/>
                {/* <Route path='summary' */}
                    {/* component={Summary}/> */}
                <Route path='manual' component={Manually}/>
                <Route path='auto' component={Auto}/>
                <Route path='*' component={NotFound} />
            </Route>
        </Router>
    </Provider> )
export default App;
