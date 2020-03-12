import React, { Component } from 'react'
import io from 'socket.io-client'
import axios from 'axios'

import './style.css'

const socket = io()

export default class MessageBox extends Component {
  constructor (props) {
    super(props)
    this.state = {
      socket: null,
      userSelected: null,
      messages: [],
      messageInput: '',
      conversationId: null
    }

    this.renderMessages = this.renderMessages.bind(this)
    this.handleSendMessage = this.handleSendMessage.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)

    socket.on('message', message => {
      if (message.conversation !== this.state.conversationId) return

      const messages = [...this.state.messages]
      messages.push(message)
      this.setState({
        messages: messages
      })
    })
  }

  componentDidMount () {
    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    this.setState(
      {
        token: token,
        userSelected: this.props.userSelected
      },
      () => this.getConversationMessages()
    )
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.userSelected !== this.state.userSelected) {
      this.setState(
        {
          userSelected: this.state.userSelected
        },
        () => this.getConversationMessages()
      )
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.userSelected !== prevState.userSelected) { return { userSelected: nextProps.userSelected } } else return null
  }

  getConversationMessages () {
    if (!this.state.userSelected) return

    axios
      .post('/api/messages/getConversationMessages', {
        token: this.state.token,
        userId: this.state.userSelected._id
      })
      .then(res => {
        console.log(res.data)
        if (res.data.length < 1 || !res.data[0].conversation) return

        this.setState({
          conversationId: res.data[0].conversation,
          messages: res.data
        })
      })
      .catch(err => console.log(err))
  }

  handleKeyPress (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.handleSendMessage()
    }
  }

  handleInputChange (e) {
    this.setState({
      messageInput: e.target.value
    })
  }

  handleSendMessage (e) {
    if (e) e.preventDefault()

    if (!this.state.userSelected) return

    axios
      .post('/api/messages/sendMessage', {
        token: this.state.token,
        to: this.state.userSelected._id,
        message: this.state.messageInput
      })
      .then(() => {
        this.setState({
          messageInput: ''
        })
      })
      .catch(err => console.log(err))
  }

  renderMessages () {
    if (!this.state.messages) return

    return this.state.messages.map((message, index) => {
      let classes = 'message'
      if (message.to === this.state.userSelected._id) classes += ' to'

      return (
        <div className={classes} key={index}>
          <div className='message-profile-img'>
            {this.state.userSelected.profileImg ? (
              <img
                src={this.state.userSelected.profileImg}
                alt={this.state.userSelected.name}
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
    // Make this into a placeholder. Including search for new conversation
    if (!this.state.userSelected) return <div className='message-box' />

    return (
      <div className='message-box'>
        <div className='friend-header'>
          <div className='friend-header-img'>
            {this.state.userSelected.profileImg ? (
              <img
                src={this.state.userSelected.profileImg}
                alt={this.state.userSelected.name}
              />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}
          </div>
          <span>{this.state.userSelected.name || 'Your Friend'}</span>
        </div>

        <div className='messages'>{this.renderMessages()}</div>

        <div className='message-cta-container'>
          <div className='message-input'>
            <div className='profile-img'>
              {this.state.userSelected.profileImg ? (
                <img
                  src={this.state.userSelected.profileImg}
                  alt={this.state.userSelected.name}
                />
              ) : (
                <svg viewBox='0 0 24 24'>
                  <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
                </svg>
              )}
            </div>
            <textarea
              placeholder='Whats on your mind?'
              onChange={this.handleInputChange}
              value={this.state.messageInput}
              onKeyDown={this.handleKeyPress}
            />
          </div>

          <div className='message-cta'>
            <input
              type='submit'
              value='Send'
              onClick={this.handleSendMessage}
            />
          </div>
        </div>
      </div>
    )
  }
}
