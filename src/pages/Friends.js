import React, { Component } from 'react'
import FriendList from '../components/Friends/FriendList'
import Findlist from '../components/Friends/Findlist'
import FriendRequests from '../components/Friends/FriendRequests'
import axios from 'axios'

export default class Friends extends Component {
  constructor (props) {
    super(props)
    this.state = {
      friends: [],
      friendRequests: [],
      nonFriends: []
    }

    this.loadFriendRequests = this.loadFriendRequests.bind(this)
    this.loadFriends = this.loadFriends.bind(this)
    this.loadNonFriends = this.loadNonFriends.bind(this)
    this.load = this.load.bind(this)
  }

  componentDidMount () {
    document.title = 'Friends | myface'

    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    this.setState(
      {
        token: token
      },
      () => this.load()
    )
  }

  load () {
    this.loadFriends()
    this.loadFriendRequests()
    this.loadNonFriends()
  }

  loadFriends () {
    axios
      .post('/api/friends/getFriends', {
        token: this.state.token
      })
      .then(res => {
        this.setState({
          friends: res.data
        })
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  loadFriendRequests () {
    axios
      .post('/api/friends/getFriendRequests', {
        token: this.state.token
      })
      .then(res => {
        this.setState({
          friendRequests: res.data
        })
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  loadNonFriends () {
    axios
      .post('/api/friends/getNonFriends', {
        token: this.state.token
      })
      .then(res => {
        this.setState({
          nonFriends: res.data
        })
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  render () {
    return (
      <div className='friends-page-container'>
        <FriendRequests
          friendRequests={this.state.friendRequests}
          reloadFriendRequests={this.loadFriendRequests}
          reloadAll={this.load}
          token={this.state.token}
        />

        <div className='friends-page-sub'>
          <FriendList friends={this.state.friends} />
          <Findlist
            nonFriends={this.state.nonFriends}
            reloadNonFriends={this.loadNonFriends}
            token={this.state.token}
          />
        </div>
      </div>
    )
  }
}
