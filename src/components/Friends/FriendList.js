import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './style.css'

export default class FriendList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      friends: []
    }

    this.renderFriends = this.renderFriends.bind(this)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.friends !== this.state.friends) {
      this.setState({
        friends: this.state.friends
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.friends !== prevState.friends) {
      return { friends: nextProps.friends }
    } else return null
  }

  renderFriends () {
    return this.state.friends.map((friend, index) => {
      return (
        <div className='friend-list-row' key={index}>
          <Link to={`/user/${friend.username}`}>
            {friend.profileImg ? (
              <img
                src={friend.profileImg}
                alt={friend.firstName + ' ' + friend.lastName}
              />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}

            <span>{friend.firstName + ' ' + friend.lastName}</span>
          </Link>
        </div>
      )
    })
  }

  render () {
    return (
      <div className='friend-list-container'>
        <div className='friend-list-header'>
          <span>Your Friends</span>
        </div>

        {this.renderFriends()}
      </div>
    )
  }
}
