import React, { Component } from 'react'
import ProfileHeader from '../components/Profile/ProfileHeader'
import ProfileManagement from '../components/Profile/ProfileManagement'

export default class Profile extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    document.title = 'Profile | myface'
  }

  render () {
    return (
      <div>
        <ProfileHeader />

        <div>
          <ProfileManagement />
        </div>
      </div>
    )
  }
}
