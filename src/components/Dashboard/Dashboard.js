import React, { Component } from 'react'
import { withRouter } from 'react-router'
import axios from 'axios'

import { connect } from 'react-redux'
import { setLoggedInUser } from '../../actions/index'

import Header from '../Header/Header'

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
          () =>
            this.setLoggedInUser(
              res.data.name,
              res.data.username,
              res.data.email
            )
        )
      })
      .catch(() => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        window.localStorage.removeItem('jwtToken')
        if (this.props.history) this.props.history.push('/login')
      })
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
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#EFEFEF',
            maxHeight: '100vh',
            overflow: 'hidden'
          }}
        >
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
  setLoggedInUser: payload => dispatch(setLoggedInUser(payload))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Dashboard))

// export default withRouter(Dashboard)
