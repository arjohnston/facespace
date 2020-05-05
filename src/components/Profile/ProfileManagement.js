import React, { Component } from 'react'
import "./style.css"

export default class ProfileManagement extends Component {
  constructor(props){
    super(props)
    this.state = {}

    this.changeFace = this.changeFace.bind(this)
    this.changeEmail = this.changeEmail.bind(this)
    this.changePassWord = this.changePassWord.bind(this)
    this.deleteAccount = this.deleteAccount.bind(this)
  }

  changeFace(){

  }

  changeEmail(){

  }

  changePassword(){

  }

  deleteAccount(){
    //function to delete account
  }

  render() {
    return (
      <div className="profile-management">
        <div className="profile-management-header">Your Account</div>

        <div className="profile-management-buttons">
          <button onClick={this.changeFace}>
            Change Your Face
          </button><br/>

          <button onClick={this.changeEmail}>
            Update Email
          </button><br/>

          <button onClick={this.changePassword}>
            Change Password
          </button><br/>

          <button className="delete-button" onClick={this.deleteAccount}>
            Delete Account
          </button>
        </div>
    </div>
    )
  }
}
