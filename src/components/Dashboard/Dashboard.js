import React, { Component } from 'react'
import io from 'socket.io-client'
import { withRouter } from 'react-router'
import axios from 'axios'

import { connect } from 'react-redux'
import {
  setLoggedInUser,
  setListOfFriends,
  setOnlineUser,
  removeOnlineUser
} from '../../actions/index'

import Header from '../Header/Header'
import Onboarding from '../Onboarding/Onboarding'

import './style.css'

export class Dashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isAuthenticated: false,
      token: null,
      isOnboarded: null,
      windowHeight: 100
    }

    this.handleOnboardingComplete = this.handleOnboardingComplete.bind(this)

    this.socket = io('ws://localhost:8080', { transports: ['websocket'] })

    this.socket.on('user-connected', payload => {
      this.updateOnlineStatus(payload.userId)
    })

    this.socket.on('user-disconnected', payload => {
      this.updateOfflineStatus(payload.userId)
    })
  }

  componentDidMount () {
    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    // console.log('2: ', this.socket)

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
            isOnboarded: res.data.isOnboarded,
            username: res.data.username,
            token: token
          },
          () => {
            this.setLoggedInUser(
              res.data.firstName,
              res.data.lastName,
              res.data.username,
              res.data.profileImg,
              res.data.email
            )
          }
        )
      })
      .catch(() => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        // this.socket.emit('user-disconnected', { userId: this.props.user.id })
        this.logout(this.state.token)

        window.localStorage.removeItem('jwtToken')
        if (this.props.history) this.props.history.push('/login')
      })

    this.setListOfFriends(token)

    if (window) {
      this.setState({
        windowHeight: window.innerHeight
      })
      // console.log(window.screen.availHeight)
    }
  }

  componentWillUnmount () {
    this.logout()

    this.socket.removeAllListeners('user-connected')
    this.socket.removeAllListeners('user-disconnected')
  }

  updateOnlineStatus (id) {
    this.props.setOnlineUser(id)
  }

  updateOfflineStatus (id) {
    this.props.removeOnlineUser(id)
  }

  // TODO: Once friends list is implemented, change this to friend list
  setListOfFriends (token) {
    axios
      .post('/api/auth/getAllUsers', { token: token })
      .then(res => {
        this.props.setListOfFriends(res.data)

        for (const user in res.data) {
          if (res.data[user].online) this.updateOnlineStatus(res.data[user]._id)
        }
      })
      .catch(err => console.log(err))
  }

  setLoggedInUser (firstName, lastName, username, profileImg, email) {
    const payload = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      profileImg: profileImg,
      email: email
    }

    this.props.setLoggedInUser(payload)
  }

  handleOnboardingComplete () {
    this.setState({
      isOnboarded: true
    })
  }

  logout () {
    if (!this.state.token) return

    axios
      .post('/api/auth/logout', { token: this.state.token })
      .then(() => {
        window.localStorage.removeItem('jwtToken')
        window.location.reload()
      })
      .catch(err => console.log(err))
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
            <div style={{ width: '100%' }}>
              <Header
                token={this.state.token}
                logout={this.logout.bind(this, this.state.token)}
              />

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
  setListOfFriends: payload => dispatch(setListOfFriends(payload)),
  setOnlineUser: payload => dispatch(setOnlineUser(payload)),
  removeOnlineUser: payload => dispatch(removeOnlineUser(payload))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Dashboard))
