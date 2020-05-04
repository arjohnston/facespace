import React, { Component } from 'react'
import "./style.css"

const profile = {
  profileImg: null,
  profileBio: "Big Bird is an 8'2\" yellow bird who lives on Sesame Street, since 1969. Big Bird has entertained millions of pre-school children and their parents with his wide-eyed wondering at the world. Big bird is also a bird who makes friends easily.",

  firstName: 'Big',
  lastName: 'Bird'
}

export default class ProfileMeta extends Component {
  constructor (props) {
    super(props)
    this.state = {
      profileImg: null,
      profileBio: ""
    }
  }

  componentDidMount() {
    this.setState({
      profileImg: profile.profileImg,
      profileBio: profile.profileBio
    })
  }

  render () {

    const name = profile.firstName + " " + profile.lastName

    return (
        <div className="profile-meta">
          <div className="profile-image-settings-container">
            <div className="profile-meta-image">
              {this.state.profileImg ? (
                <img
                  src={this.state.profileImg}
                  alt={name}
                  />
                ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
              )}
            </div>

            <div className="profile-settings">
              <div className="profile-settings-header">Your Account</div>

              <div className="profile-settings-buttons">
                <button>
                  Change Your Face
                </button><br/>

                <button>
                  Update Email
                </button><br/>

                <button>
                  Change Password
                </button><br/>

                <button id="delete-button">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          <p>{this.state.profileBio}</p>
        </div>
    )
  }
}
