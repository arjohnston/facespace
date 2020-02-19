import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import store from './store'
import { Provider } from 'react-redux'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './components/Dashboard/Dashboard'
import Overview from './pages/Overview'
import ForgotPassword from './pages/ForgotPassword'
import Error from './pages/Error'

import 'normalize.css'
import './index.css'

const TEST = process.env.NODE_ENV === 'test'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      token: ''
    }
  }

  componentDidMount () {
    if (!TEST) {
      const token = window.localStorage
        ? window.localStorage.getItem('jwtToken')
        : ''

      if (token) {
        this.setState(
          {
            token: token
          },
          () => {
            if (this.props.history) this.props.history.push('/')
          }
        )
      }
    }
  }

  render () {
    return (
      <Provider store={store}>
        <Router>
          <div>
            <Switch>
              <Route
                exact
                path='/'
                render={() => (
                  <Dashboard>
                    <Route exact path='/' render={() => <Overview />} />
                  </Dashboard>
                )}
              />
              <Route path='/login' component={Login} />
              <Route path='/register' component={Register} />
              <Route path='/forgot-password' component={ForgotPassword} />
              <Route
                render={function () {
                  return <Error />
                }}
              />
            </Switch>
          </div>
        </Router>
      </Provider>
    )
  }
}
