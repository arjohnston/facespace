import React, { Component } from 'react'
import './style.css'
import axios from 'axios'
import AttachmentInput from '../Attachment/Attachment'

export default class ProfileManagement extends Component {
  constructor (props) {
    super(props)
    this.state = {
      popupOpen: false,
      popupType: null,
      imageLoadedSrc: '',
      imageLoadedName: ''
    }

    this.handleChangeFace = this.handleChangeFace.bind(this)
    this.handleChangeEmail = this.handleChangeEmail.bind(this)
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleDeleteAccount = this.handleDeleteAccount.bind(this)

    this.handleTogglePopupOpen = this.handleTogglePopupOpen.bind(this)
    this.handleFileInput = this.handleFileInput.bind(this)
  }

  handleChangeFace () {
    axios
      .post('/api/auth/edit', {
        token: this.props.token,
        profileImg: this.state.imageLoadedSrc
      })
      .then(res => {
        this.props.reloadUser()
      })
  }

  handleChangeEmail (newEmail) {
    axios
      .post('/api/auth/edit', {
        token: this.state.token,
        email: newEmail
      })
      .then(res => {
        this.setState({
          email: newEmail
        })
      })
  }

  handleChangePassword (newPassword) {
    axios
      .post('/api/auth/updatePassword', {
        token: this.state.token,
        password: newPassword
      })
      .then(res => {
        this.setState({
          password: newPassword
        })
      })
  }

  handleDeleteAccount () {
    if (this.state.userId !== this.props.user) return

    axios
      .post('api/auth/deleteUser', {
        token: this.state.token
      })
      .then(res => {
        console.log(res.data)
      })
  }

  handleTogglePopupOpen (type) {
    this.setState({
      popupOpen: !this.state.popupOpen,
      popupType: type
    })
  }

  handleFileInput (files) {
    // Save file
    if (files && files[0]) {
      const reader = new FileReader()
      reader.readAsDataURL(files[0])

      reader.onload = readerEvent => {
        this.setState(
          {
            imageLoadedSrc: readerEvent.target.result,
            imageLoadedName: files[0].name
          },
          () => {
            this.handleChangeFace()
          }
        )
      }
    }
  }

  render () {
    return (
      <div className='profile-management'>
        <div
          className='profile-popup'
          style={{ display: this.state.popupOpen ? 'flex' : 'none' }}
        >
          {this.state.popupType === 'profileImg' && (
            <AttachmentInput
              onCloseAttachment={this.handleTogglePopupOpen}
              onFileInput={this.handleFileInput}
              isOpen={this.state.popupOpen}
            />
          )}

          {this.state.popupType === 'email' && (
            <div className='popup-container'>
              <div className='popup-header'>Update Email</div>

              <label htmlFor='delete'>Your Email</label>
              <input
                type='text'
                placeholder='Enter Your Account'
                name='delete'
                id='delete'
                value={this.props.user.email}
              />
              <div className='button button'>Update Email</div>

              <div
                className='popup-close-button'
                onClick={this.handleTogglePopupOpen.bind(this, null)}
              >
                <svg width='24' height='24'>
                  <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                </svg>
              </div>
            </div>
          )}

          {this.state.popupType === 'password' && (
            <div className='popup-container'>
              <div className='popup-header'>Change Password</div>

              <label htmlFor='current'>Current Password</label>
              <input type='password' name='current' id='current' />

              <label htmlFor='new-pwd'>New Password</label>
              <input type='password' name='new-pwd' id='new-pwd' />

              <label htmlFor='cnfm-pwd'>Confirm Password</label>
              <input type='password' name='cnfm-pwd' id='cnfm-pwd' />
              <div className='button'>Change Password</div>

              <div
                className='popup-close-button'
                onClick={this.handleTogglePopupOpen.bind(this, null)}
              >
                <svg width='24' height='24'>
                  <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                </svg>
              </div>
            </div>
          )}

          {this.state.popupType === 'delete' && (
            <div className='popup-container'>
              <div className='popup-header'>Delete Account</div>

              <p>Enter your email to delete the account:</p>
              <span>{this.props.user.email}</span>
              <label htmlFor='delete'>Your Account</label>
              <input
                type='text'
                placeholder='Enter Your Account'
                name='delete'
                id='delete'
              />
              <div className='button button-red'>Delete Account</div>

              <div
                className='popup-close-button'
                onClick={this.handleTogglePopupOpen.bind(this, null)}
              >
                <svg width='24' height='24'>
                  <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className='profile-management-header'>Your Account</div>

        <div className='profile-management-buttons'>
          <button onClick={this.handleTogglePopupOpen.bind(this, 'profileImg')}>
            Change Your Face
          </button>

          <button onClick={this.handleTogglePopupOpen.bind(this, 'email')}>
            Update Email
          </button>

          <button onClick={this.handleTogglePopupOpen.bind(this, 'password')}>
            Change Password
          </button>

          <button
            className='delete-button'
            onClick={this.handleTogglePopupOpen.bind(this, 'delete')}
          >
            Delete Account
          </button>
        </div>
      </div>
    )
  }
}
