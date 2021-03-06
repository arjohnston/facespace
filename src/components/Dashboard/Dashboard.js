import React, { Component } from 'react'
import { withRouter } from 'react-router'
import axios from 'axios'

import { connect } from 'react-redux'
import { setLoggedInUser, setListOfFriends } from '../../actions/index'

import Header from '../Header/Header'
import Onboarding from '../Onboarding/Onboarding'
import Messenger from '../Messaging/Messenger'

import './style.css'

export class Dashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isAuthenticated: false,
      token: null,
      isOnboarded: null,
      windowHeight: 100,
      location: null
    }

    this.handleOnboardingComplete = this.handleOnboardingComplete.bind(this)
    this.handleWindowResize = this.handleWindowResize.bind(this)
  }

  componentDidMount () {
    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    // Immediately direct to /login if no jwtToken token present
    if (!token) {
      if (this.props.history) this.props.history.push('/login')
      return
    }

    // Verify if token is valid
    // As user persmissions are created, the verify auth should be more extensive
    // and return views as the permissions defines
    axios
      .post('/api/auth/verify', { token })
      .then(res => {
        this.setState(
          {
            isAuthenticated: true,
            token: token,
            location: this.props.location
          },
          () => {
            this.getUser(token)

            this.setListOfFriends(token)
          }
        )
      })
      .catch(() => {
        // if err statusCode == 401, then logout
        this.logout()
      })

    if (window) {
      this.handleWindowResize()

      window.addEventListener('resize', this.handleWindowResize)
    }
  }

  componentWillUnmount () {
    this.logout()

    if (window) window.removeEventListener('resize', this.handleWindowResize)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.location !== this.state.location) {
      this.setState({
        location: this.state.location
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.location !== prevState.location) {
      return { location: nextProps.location }
    } else return null
  }

  getUser (token) {
    axios
      .post('/api/auth/getUser', { token: token })
      .then(res => {
        this.setLoggedInUser(
          res.data.firstName,
          res.data.lastName,
          res.data.username,
          res.data.profileImg,
          res.data.email,
          res.data.id,
          res.data.isOnboarded
        )
      })
      .catch(err => console.log(err))
  }

  handleWindowResize () {
    if (!window) return
    this.setState({
      windowHeight: window.innerHeight
    })
  }

  // TODO: Once friends list is implemented, change this to friend list
  setListOfFriends (token) {
    axios
      .post('/api/friends/getFriends', { token: token })
      .then(res => {
        this.props.setListOfFriends(res.data)
      })
      .catch(err => console.log(err))
  }

  setLoggedInUser (
    firstName,
    lastName,
    username,
    profileImg,
    email,
    id,
    isOnboarded
  ) {
    const payload = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      profileImg: profileImg,
      email: email,
      userId: id
    }

    this.setState({
      isOnboarded: isOnboarded
    })

    this.props.setLoggedInUser(payload)
  }

  handleOnboardingComplete () {
    this.getUser(this.state.token)
  }

  logout () {
    window.localStorage.removeItem('jwtToken')
    if (this.props.history) this.props.history.push('/login')
    else window.location.reload()
  }

  render () {
    return (
      this.state.isAuthenticated &&
      this.state.isOnboarded !== null && (
        <div
          className='dashboard-container'
          style={{
            minHeight: this.state.windowHeight + 'px',
            maxHeight: this.state.windowHeight + 'px'
          }}
        >
          {this.state.isOnboarded ? (
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <Header
                token={this.state.token}
                logout={this.logout.bind(this, this.state.token)}
              />

              {this.state.location &&
                this.state.location.pathname !== '/messaging' &&
                  <Messenger token={this.state.token} />}

              {this.props.children}
            </div>
          ) : (
            <Onboarding
              token={this.state.token}
              onOnboardingComplete={this.handleOnboardingComplete}
              logout={this.logout.bind(this, this.state.token)}
            />
          )}
        </div>
      )
    )
  }
}

const mapStateToProps = state => ({
  ...state
})

const mapDispatchToProps = dispatch => ({
  setLoggedInUser: payload => dispatch(setLoggedInUser(payload)),
  setListOfFriends: payload => dispatch(setListOfFriends(payload))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Dashboard))
