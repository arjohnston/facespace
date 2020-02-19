import React, { Component } from 'react'

export default class extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout () {
    window.localStorage.removeItem('jwtToken')
    window.location.reload()
  }

  render () {
    return (
      <div className='dashboard-page'>
        <button onClick={this.handleLogout}>
          <svg style={{ width: '24px', height: '24px' }} viewBox='0 0 24 24'>
            <path
              fill='#FFFFFF'
              d='M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z'
            />
          </svg>
          Logout
        </button>
        <h1>Hello world</h1>
      </div>
    )
  }
}
