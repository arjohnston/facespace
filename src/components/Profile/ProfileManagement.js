import React, { Component } from 'react'
import './style.css'

export default class ProfileManagement extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleChangeFace = this.handleChangeFace.bind(this)
    this.handleChangeEmail = this.handleChangeEmail.bind(this)
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleDeleteAccount = this.handleDeleteAccount.bind(this)
  }

  handleChangeFace () {}

  handleChangeEmail () {}

  handleChangePassword () {}

  handleDeleteAccount () {
    // function to delete account
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

          <button className='delete-button' onClick={this.handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>
    )
  }
}
