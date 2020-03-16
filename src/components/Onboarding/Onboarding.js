import React, { Component } from 'react'
import { withRouter } from 'react-router'
import axios from 'axios'
// import io from 'socket.io-client'

import AttachmentInput from '../Attachment/Attachment'

import { connect } from 'react-redux'
import { setLoggedInUser } from '../../actions/index'

import './style.css'

export class Onboarding extends Component {
  constructor () {
    super()
    this.state = {
      username: '',
      firstName: '',
      lastName: '',
      profileImgSrc: '',
      message: '',
      usernameAvailable: null,
      recommendingUsername: true,
      recommendUsernameNumber: 0,
      attachmentInputShown: false
    }

    this.handleLogout = this.handleLogout.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCheckIfUsernameExists = this.handleCheckIfUsernameExists.bind(this)
    this.handleToggleAttachmentInputShown = this.handleToggleAttachmentInputShown.bind(this)
    this.handleFileInput = this.handleFileInput.bind(this)

    // this.socket = io('ws://localhost:8080', { transports: ['websocket'] })
  }

  componentDidMount () {
    document.title = 'myface: Onboarding'
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.user !== this.state.user) {
      this.setState(
        {
          user: this.state.user
        }, () => this.recommendUserName()
      )
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.user !== prevState.user) {
      return { user: nextProps.user }
    } else return null
  }

  handleCheckIfUsernameExists () {
    if (!this.state.username) return

    axios
      .post('/api/auth/checkIfUsernameExists', { username: this.state.username })
      .then(result => {
        if (result.status >= 200 && result.status < 300) {
          this.setState({
            usernameAvailable: true,
            message: ''
          })
        }
      })
      .catch(() => {
        this.setState({
          usernameAvailable: false,
          message: ''
        }, () => {
          // console.log('HIT')
          if (this.state.recommendingUsername) this.recommendUserName()
        })
      })
  }

  handleChange (e) {
    const state = Object.assign({}, { ...this.state }, null)
    state[e.target.name] = e.target.value
    this.setState(state)

    if (this.state.recommendingUsername) this.setState({ recommendingUsername: false })
  }

  handleSubmit (e) {
    e.preventDefault()

    const { username, firstName, lastName, profileImgSrc } = this.state

    const queryEmail = this.props.user.email

    // TODO
    axios
      .post('/api/auth/edit', { queryEmail, firstName, lastName, username, isOnboarded: true, profileImg: profileImgSrc, token: this.props.token })
      .then(() => {
        this.setState({ message: '' })
        this.setLoggedInUser(firstName, lastName, username, profileImgSrc, queryEmail)
      })
      .then(() => {
        this.props.onOnboardingComplete()
      })
      .catch(error => {
        console.log(error)
        this.setState({
          message: error.response.data.message
        })
      })
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

  recommendUserName () {
    let recommendedUserName = ''

    if (this.props.user) {
      recommendedUserName = this.props.user.email.match(/^([^@]*)@/)[1]

      if (this.state.recommendUsernameNumber > 0) {
        recommendedUserName = recommendedUserName + this.state.recommendUsernameNumber
      }

      this.setState({
        username: recommendedUserName,
        recommendUsernameNumber: this.state.recommendUsernameNumber + 1
      }, () => this.handleCheckIfUsernameExists())
    }
  }

  handleLogout () {
    // this.socket.emit('disconnect', this.props.user.id)

    // window.localStorage.removeItem('jwtToken')
    // window.location.reload()
    this.props.logout()
  }

  handleToggleAttachmentInputShown () {
    this.setState({
      attachmentInputShown: !this.state.attachmentInputShown
    })
  }

  handleFileInput (files) {
    // Save file
    if (files && files[0]) {
      const reader = new FileReader()
      reader.readAsDataURL(files[0])

      reader.onload = readerEvent => {
        this.setState({
          profileImgSrc: readerEvent.target.result
        })
      }
    }

    this.handleToggleAttachmentInputShown()
  }

  render () {
    const { username, firstName, lastName, message } = this.state

    return (
      <div className='login-container'>
        <div
          style={{
            display: this.state.attachmentInputShown ? 'block' : 'none'
          }}
        >
          <AttachmentInput
            onCloseAttachment={this.handleToggleAttachmentInputShown}
            onFileInput={this.handleFileInput}
            isOpen={this.state.attachmentInputShown}
          />
        </div>
        <div className='login-header'>
          <img src='/logo.svg' alt='logo' style={{ height: '60px' }} />

          <div onClick={this.handleLogout} className='header-logout'>
            <svg viewBox='0 0 24 24'>
              <path d='M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z' />
            </svg>
            Logout
          </div>
        </div>
        <h1>Your Personal Details</h1>
        <form onSubmit={this.handleSubmit}>
          {message !== '' && <span>{message}</span>}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className='login-profile-image'>
              {this.state.profileImgSrc ? (
                <img
                  src={this.state.profileImgSrc}
                  alt={`${this.state.firstName} ${this.state.lastName}`}
                />
              ) : (
                <svg viewBox='0 0 24 24'>
                  <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
                </svg>
              )}
            </div>
            <span className='login-profile-image-cta' onClick={this.handleToggleAttachmentInputShown}>Upload Photo</span>
          </div>

          <label htmlFor='username'>Username</label>
          <div className='form-input-wrapper'>
            <input
              type='text'
              name='username'
              id='username'
              value={username}
              onChange={this.handleChange}
              onBlur={this.handleCheckIfUsernameExists}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,15C12.81,15 13.5,14.7 14.11,14.11C14.7,13.5 15,12.81 15,12C15,11.19 14.7,10.5 14.11,9.89C13.5,9.3 12.81,9 12,9C11.19,9 10.5,9.3 9.89,9.89C9.3,10.5 9,11.19 9,12C9,12.81 9.3,13.5 9.89,14.11C10.5,14.7 11.19,15 12,15M12,2C14.75,2 17.1,3 19.05,4.95C21,6.9 22,9.25 22,12V13.45C22,14.45 21.65,15.3 21,16C20.3,16.67 19.5,17 18.5,17C17.3,17 16.31,16.5 15.56,15.5C14.56,16.5 13.38,17 12,17C10.63,17 9.45,16.5 8.46,15.54C7.5,14.55 7,13.38 7,12C7,10.63 7.5,9.45 8.46,8.46C9.45,7.5 10.63,7 12,7C13.38,7 14.55,7.5 15.54,8.46C16.5,9.45 17,10.63 17,12V13.45C17,13.86 17.16,14.22 17.46,14.53C17.76,14.84 18.11,15 18.5,15C18.92,15 19.27,14.84 19.57,14.53C19.87,14.22 20,13.86 20,13.45V12C20,9.81 19.23,7.93 17.65,6.35C16.07,4.77 14.19,4 12,4C9.81,4 7.93,4.77 6.35,6.35C4.77,7.93 4,9.81 4,12C4,14.19 4.77,16.07 6.35,17.65C7.93,19.23 9.81,20 12,20H17V22H12C9.25,22 6.9,21 4.95,19.05C3,17.1 2,14.75 2,12C2,9.25 3,6.9 4.95,4.95C6.9,3 9.25,2 12,2Z' />
            </svg>

            {this.state.usernameAvailable && (
              <svg viewBox='0 0 24 24' className='checkmark'>
                <path d='M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' />
              </svg>
            )}
          </div>
          {(!this.state.usernameAvailable && this.state.usernameAvailable !== null && !this.state.recommendingUsername) &&
            <div style={{ margin: '-12px 0 12px 12px' }}>
              <span>✘ Username {username} is not available</span>
            </div>}

          <label htmlFor='firstName'>First Name</label>
          <div className='form-input-wrapper'>
            <input
              type='text'
              name='firstName'
              id='firstName'
              value={firstName}
              onChange={this.handleChange}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M21.41 11.58L12.41 2.58A2 2 0 0 0 11 2H4A2 2 0 0 0 2 4V11A2 2 0 0 0 2.59 12.42L11.59 21.42A2 2 0 0 0 13 22A2 2 0 0 0 14.41 21.41L21.41 14.41A2 2 0 0 0 22 13A2 2 0 0 0 21.41 11.58M13 20L4 11V4H11L20 13M6.5 5A1.5 1.5 0 1 1 5 6.5A1.5 1.5 0 0 1 6.5 5Z' />
            </svg>
          </div>

          <label htmlFor='lastName'>Last Name</label>
          <div className='form-input-wrapper'>
            <input
              type='text'
              name='lastName'
              id='lastName'
              value={lastName}
              onChange={this.handleChange}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M21.41 11.58L12.41 2.58A2 2 0 0 0 11 2H4A2 2 0 0 0 2 4V11A2 2 0 0 0 2.59 12.42L11.59 21.42A2 2 0 0 0 13 22A2 2 0 0 0 14.41 21.41L21.41 14.41A2 2 0 0 0 22 13A2 2 0 0 0 21.41 11.58M13 20L4 11V4H11L20 13M6.5 5A1.5 1.5 0 1 1 5 6.5A1.5 1.5 0 0 1 6.5 5Z' />
            </svg>
          </div>

          <input
            disabled={
              !this.state.username.length > 0 &&
              !this.state.firstName.length > 0 &&
              !this.state.lastName.length > 0
            }
            className={
              this.state.username.length > 0 &&
              this.state.firstName.length > 0 &&
              this.state.lastName.length > 0
                ? 'active'
                : 'inactive'
            }
            type='submit'
            value='Submit'
          />
        </form>
      </div>
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
)(withRouter(Onboarding))
