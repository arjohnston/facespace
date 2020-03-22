import React, { Component } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

import './style.css'

export class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout () {
    this.props.logout()
  }

  render () {
    return (
      <div className='header' id='header'>
        <div>
          <Link to='/'>
            <img src='/logo.svg' alt='MyFace logo' className='logo' />
          </Link>
        </div>
        <nav>
          <NavLink to='/' exact activeClassName='nav-active'>
            <svg viewBox='0 0 24 24'>
              <path d='M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z' />
            </svg>
            <span>Home</span>
          </NavLink>
          <NavLink to='/messaging' exact activeClassName='nav-active'>
            <svg viewBox='0 0 24 24'>
              <path d='M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20' />
            </svg>
            <span>Messaging</span>
          </NavLink>
          <NavLink to='/friends' exact activeClassName='nav-active'>
            <svg viewBox='0 0 24 24'>
              <path d='M13.07 10.41A5 5 0 0 0 13.07 4.59A3.39 3.39 0 0 1 15 4A3.5 3.5 0 0 1 15 11A3.39 3.39 0 0 1 13.07 10.41M5.5 7.5A3.5 3.5 0 1 1 9 11A3.5 3.5 0 0 1 5.5 7.5M7.5 7.5A1.5 1.5 0 1 0 9 6A1.5 1.5 0 0 0 7.5 7.5M16 17V19H2V17S2 13 9 13 16 17 16 17M14 17C13.86 16.22 12.67 15 9 15S4.07 16.31 4 17M15.95 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13Z' />
            </svg>
            <span>Friends</span>
          </NavLink>

          <div className='profile-menu-wrapper'>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div className='profile-menu-img'>
                {this.props.user.profileImg ? (
                  <img
                    src={this.props.user.profileImg}
                    alt={`${this.state.firstName} ${this.state.lastName}`}
                  />
                ) : (
                  <svg viewBox='0 0 24 24' className='profile-menu-icon'>
                    <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
                  </svg>
                )}
              </div>
              <div className='profile-menu-label'>
                <span>Me</span>
                <svg className='profile-menu-down-icon' viewBox='0 0 24 24'>
                  <path d='M7,10L12,15L17,10H7Z' />
                </svg>
              </div>
            </div>

            <div className='profile-menu'>
              <div className='profile-user-account'>
                {this.props.user.profileImg ? (
                  <div className='profile-user-account-img'>
                    <img
                      src={this.props.user.profileImg}
                      alt={`${this.state.firstName} ${this.state.lastName}`}
                    />
                  </div>
                ) : (
                  <svg viewBox='0 0 24 24'>
                    <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
                  </svg>
                )}
                <div className='profile-user-account-details'>
                  <span style={{ fontSize: '0.8em', color: '#777' }}>
                    User Account
                  </span>
                  <span>@{this.props.user.username}</span>
                </div>
              </div>
              <Link to={`/user/${this.props.user.username}`}>
                <svg viewBox='0 0 24 24'>
                  <path d='M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z' />
                </svg>
                <span>Profile</span>
              </Link>
              <div onClick={this.handleLogout}>
                <svg viewBox='0 0 24 24'>
                  <path d='M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z' />
                </svg>
                Logout
              </div>
            </div>
          </div>
        </nav>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  ...state
})

export default connect(mapStateToProps)(withRouter(Header))
