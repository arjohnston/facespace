import React, { Component } from 'react'
import { withRouter } from 'react-router'
import axios from 'axios'

import { connect } from 'react-redux'
import { setLoggedInUser, setListOfFriends } from '../../actions/index'

import Header from '../Header/Header'

import './style.css'

export class Dashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isAuthenticated: false,
      username: null,
      token: null
    }
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
            username: res.data.username,
            token: token
          },
          () => {
            this.setLoggedInUser(
              res.data.name,
              res.data.username,
              res.data.email
            )

            // this.setListOfFriends(token)
          }
        )
      })
      .catch(() => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        window.localStorage.removeItem('jwtToken')
        if (this.props.history) this.props.history.push('/login')
      })

    this.setListOfFriends(token)
  }

  // TODO: Once friends list is implemented, change this to friend list
  setListOfFriends (token) {
    axios
      .post('/api/auth/getAllUsers', { token: token })
      .then(res => {
        this.props.setListOfFriends(res.data)
      })
      .catch(err => console.log(err))
  }

  setLoggedInUser (name, username, email) {
    const payload = {
      name: name,
      username: username,
      email: email
    }

    this.props.setLoggedInUser(payload)
  }

  render () {
    return (
      this.state.isAuthenticated && (
        <div className='dashboard-container'>
          <div style={{ width: '100%' }}>
            <Header />

            {this.props.children}
          </div>
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

// export default withRouter(Dashboard)
