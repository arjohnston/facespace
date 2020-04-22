import React, { Component } from 'react'
import FriendList from '../components/Friends/FriendList'

export default class Friends extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='friends-page-container'>
        <FriendList />
        Hello there, friend.
      </div>
    )
  }
}
