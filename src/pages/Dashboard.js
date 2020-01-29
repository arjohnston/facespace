import React, { Component } from 'react'
import axios from 'axios'

export default class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isAuthenticated: false
    }

    this.handleLogout = this.handleLogout.bind(this)
  }

  componentDidMount () {
    const token = window.localStorage ? window.localStorage.getItem('jwtToken') : ''

    // Immediately direct to /login if no jwtToken token present
    if (!token) {
      if (this.props.history) this.props.history.push('/login')
      return
    }

    // Verify if token is valid
    // As user persmissions are created, the verify auth should be more extensive
    // and return views as the permissions defines
    axios.post('/api/auth/verify', { token })
      .then(res => {
        this.setState({ isAuthenticated: true })
      })
      .catch(() => {
        if (this.props.history) this.props.history.push('/login')
      })
  }

  handleLogout () {
    window.localStorage.removeItem('jwtToken')
    window.location.reload()
  }

  render () {
    return (
      this.state.isAuthenticated &&
        <div>
          <button onClick={this.handleLogout}>
            <svg style={{ width: '24px', height: '24px' }} viewBox='0 0 24 24'>
              <path fill='#FFFFFF' d='M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z' />
            </svg>Logout
          </button>
          <h1>Hello world</h1>
        </div>
    )
  }
}
