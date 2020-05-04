import React, { Component } from 'react'
import "./style.css"

export default class ProfileManagement extends Component {
  constructor(props){
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div className="profile-management">
        <div className="profile-management-header">Your Account</div>

        <div className="profile-management-buttons">
          <button>
            Change Your Face
          </button><br/>

          <button>
            Update Email
          </button><br/>

          <button>
            Change Password
          </button><br/>

          <button className="delete-button">
            Delete Account
          </button>
        </div>
    )
  }
}
