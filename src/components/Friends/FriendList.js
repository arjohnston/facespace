import React, { Component } from 'react'
import './style.css'

const array = [
  {
    name: 'Cookie Monster',
    img: null
  },
  {
    name: 'Garbage Man',
    img: null
  },
  {
    name: 'Ernie',
    img: null
  },
  {
    name: 'Yellow Bird',
    img: null
  }
]

export default class FriendList extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.renderFriends = this.renderFriends.bind(this)
  }

  renderFriends () {
    return array.map((friend, index) => {
      return (
        <div className='friend-list-row' key={index}>
          {friend.img ? (
            <img src={friend.img} alt={friend.name} />
          ) : (
            <svg viewBox='0 0 24 24'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>
          )}

          <span>{friend.name}</span>
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
