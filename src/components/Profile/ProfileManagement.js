import React, { Component } from 'react'
import "./style.css"

export default class ProfileManagement extends Component {
  constructor(props){
    super(props)
    this.state = {}
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
          <button onclick="changeFace()">
            Change Your Face
          </button><br/>

          <button onclick="changeEmail()">
            Update Email
          </button><br/>

          <button onclick="changePassword()">
            Change Password
          </button><br/>

          <button className="delete-button" onclick="deleteAccount()">
            Delete Account
          </button>
        </div>
    </div>
    )
  }
}
