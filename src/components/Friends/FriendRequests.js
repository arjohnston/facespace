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
  }
]

export default class FriendList extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.renderRequests = this.renderRequests.bind(this)
  }

  renderRequests () {
    return array.map((friend, index) => {
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
              <span>{friend.name}</span>

              <span>Wants to be your friend</span>
            </div>
          </div>

          <div style={{ display: 'flex' }}>
            <div className='button accept'>Accept</div>
            <div className='button reject'>Reject</div>
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
