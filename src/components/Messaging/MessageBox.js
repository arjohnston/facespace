import React, { Component } from 'react'

import './style.css'

export default class MessageBox extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.renderMessages = this.renderMessages.bind(this)
  }

  componentDidMount () {}

  renderMessages () {
    if (!this.props.messages || !this.props.messages.messages) return

    return this.props.messages.messages.map((message, index) => {
      let classes = 'message'
      if (message.type === 'to') classes += ' to'

      return (
        <div className={classes} key={index}>
          <div className='message-profile-img'>
            {this.props.messages.profileImg ? (
              <img
                src={this.props.messages.profileImg}
                alt={this.props.messages.name}
              />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}
          </div>
          <div className='message-container'>
            <span className='timestamp'>{message.timestamp}</span>
            <span>{message.message}</span>
          </div>
        </div>
      )
    })
  }

  render () {
    return (
      <div className='message-box'>
        <div className='friend-header'>
          <div className='friend-header-img'>
            {this.props.messages.profileImg ? (
              <img
                src={this.props.messages.profileImg}
                alt={this.props.messages.name}
              />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}
          </div>
          <span>{this.props.messages.name || 'Your Friend'}</span>
        </div>

        <div className='messages'>{this.renderMessages()}</div>

        <div className='message-cta-container'>
          <div className='message-input'>
            <div className='profile-img'>
              {this.props.messages.profileImg ? (
                <img
                  src={this.props.messages.profileImg}
                  alt={this.props.messages.name}
                />
              ) : (
                <svg viewBox='0 0 24 24'>
                  <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
                </svg>
              )}
            </div>
            <textarea placeholder='Whats on your mind?' />
          </div>

          <div className='message-cta'>
            <input type='submit' value='Send' />
          </div>
        </div>
      </div>
    )
  }
}
