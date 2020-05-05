import React, { Component } from 'react'
import FriendList from '../components/Friends/FriendList'
import Findlist from '../components/Friends/Findlist'
import FriendRequests from '../components/Friends/FriendRequests'

export default class Friends extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    document.title = 'Friends | myface'
  }

  render () {
    return (
      <div className='friends-page-container'>
        <FriendRequests />

        <div className='friends-page-sub'>
          <FriendList />
          <Findlist />
        </div>
      </div>
    )
  }
}
