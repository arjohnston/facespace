import React, { Component } from 'react'
import FriendList from '../components/Friends/FriendList'
import Findlist from '../components/Friends/Findlist'

export default class Friends extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='friends-page-container'>
        <div className='friendship-request'>
          New Request
          <button type='submit' className='accept'>
            Accept
          </button>
          <button type='submit' className='reject'>
            Reject
          </button>
        </div>
        <div className='friends-page-sub'>
          <FriendList />
          <Findlist />
        </div>
      </div>
    )
  }
}
