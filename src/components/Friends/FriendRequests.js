import React, { Component } from 'react'
import axios from 'axios'
import './style.css'

export default class FriendList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      friendRequests: []
    }

    this.renderRequests = this.renderRequests.bind(this)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.friendRequests !== this.state.friendRequests) {
      this.setState({
        friendRequests: this.state.friendRequests
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.friendRequests !== prevState.friendRequests) {
      return { friendRequests: nextProps.friendRequests }
    } else return null
  }

  rejectFriendRequest (id) {
    axios
      .post('/api/friends/removeFriendRequest', {
        token: this.props.token,
        friendId: id
      })
      .then(() => {
        this.props.reloadFriendRequests()
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  acceptFriendRequest (id) {
    axios
      .post('/api/friends/removeFriendRequest', {
        token: this.props.token,
        friendId: id
      })
      .then(() => {
        axios
          .post('/api/friends/addFriend', {
            token: this.props.token,
            friendId: id
          })
          .then(() => {
            this.props.reloadAll()
          })
          .catch(error => {
            // if err statusCode == 401, then remove token & push /login
            // otherwise log the token
            console.log(error)
          })
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  renderRequests () {
    return this.state.friendRequests.map((friend, index) => {
      return (
        <div className='request-row' key={index}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {friend.profileImg ? (
              <img
                src={friend.profileImg}
                alt={`${friend.firstName} ${friend.lastName}` || 'User'}
              />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}

            <div className='request-meta'>
              <span>
                {friend.firstName} {friend.lastName}
              </span>

              <span>Wants to be your friend</span>
            </div>
          </div>

          <div style={{ display: 'flex' }}>
            <div
              className='button accept'
              onClick={this.acceptFriendRequest.bind(this, friend._id)}
            >
              Accept
            </div>
            <div
              className='button reject'
              onClick={this.rejectFriendRequest.bind(this, friend._id)}
            >
              Reject
            </div>
          </div>
        </div>
      )
    })
  }

  render () {
    return (
      <div className='friend-request-container'>{this.renderRequests()}</div>
    )
  }
}
