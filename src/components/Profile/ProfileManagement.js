import React, { Component } from 'react'
import './style.css'
import axios from 'axios'
import { connect } from 'react-redux'

// import Profile from '../pages/Profile'

export default class ProfileManagement extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleChangeFace = this.handleChangeFace.bind(this)
    this.handleChangeEmail = this.handleChangeEmail.bind(this)
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleDeleteAccount = this.handleDeleteAccount.bind(this)
  }

  handleChangeFace (newProfileImg) {
    axios
      .post('/api/auth/edit', {
        token: this.state.token,
        profileImg: newProfileImg
      })
      .then(res => {
        this.setState({
          profileImg: newProfileImg
        })
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

  render () {
    return (
      <div className='profile-management'>
        <div className='profile-management-header'>Your Account</div>

        <div className='profile-management-buttons'>
          <button onClick={this.handleChangeFace}>Change Your Face</button>
          <br />

          <button onClick={this.handleChangeEmail}>Update Email</button>
          <br />

          <button onClick={this.handleChangePassword}>Change Password</button>
          <br />

          {this.state.userId === this.props.user && (
            <button className='delete-button' onClick={this.handleDeleteAccount}>
              Delete Account
            </button>
          )}
        </div>
      </div>
    )
  }
}
