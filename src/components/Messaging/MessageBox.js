import React, { Component } from 'react'
import io from 'socket.io-client'
import axios from 'axios'

import { connect } from 'react-redux'

import './style.css'

export class MessageBox extends Component {
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

    this.chatBottom = React.createRef()
    this.chatInput = React.createRef()

    this.socket = io('ws://localhost:8080', { transports: ['websocket'] })

    this.socket.on('message', message => {
      this.appendMessage(message)
    })
  }

  componentDidMount () {
    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    this.setState(
      {
        token: token,
        userSelected: this.props.userSelected,
        componentMounted: true
      },
      () => this.getConversationMessages()
    )
  }

  componentWillUnmount () {
    this.socket.removeAllListeners('message')
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.userSelected !== this.state.userSelected) {
      this.setState(
        {
          userSelected: this.state.userSelected,
          messages: [],
          conversationId: null
        },
        () => this.getConversationMessages()
      )
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.userSelected !== prevState.userSelected) {
      return { userSelected: nextProps.userSelected }
    } else return null
  }

  appendMessage (message) {
    if (message.conversation !== this.state.conversationId) return

    const messages = [...this.state.messages]
    messages.push(message)
    this.setState(
      {
        messages: messages
      },
      () => this.scrollIntoView(true)
    )
  }

  getConversationMessages () {
    if (!this.state.userSelected) return

    axios
      .post('/api/messages/getConversationMessages', {
        token: this.state.token,
        userId: this.state.userSelected._id
      })
      .then(res => {
        if (res.data.length < 1 || !res.data[0].conversation) return

        this.setState(
          {
            conversationId: res.data[0].conversation,
            messages: res.data
          },
          () => {
            this.scrollIntoView()
            this.setInputIntoFocus()
          }
        )
      })
      .catch(err => console.log(err))
  }

  scrollIntoView (effect) {
    if (effect) {
      return this.chatBottom.current.scrollIntoView({ behavior: 'smooth' })
    }
    this.chatBottom.current.scrollIntoView()
  }

  setInputIntoFocus () {
    this.chatInput.current.focus()
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
    if (this.state.messageInput === '') return

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

    const MONTHS = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC'
    ]

    let prevMessageMonth = null
    let prevMessageDate = null

    return (
      <div>
        {this.state.messages.map((message, index) => {
          let classes = 'message'
          if (message.to === this.state.userSelected._id) classes += ' to'

          // console.log(new Date(message.date))

          const date = new Date(message.date)
          const month = date.getMonth()
          const day = date.getDate()
          let hours = date.getHours()
          let minutes = date.getMinutes()
          const label = hours >= 12 ? ' PM' : ' AM'
          if (hours > 12) hours = hours - 12
          if (minutes < 10) minutes = '0' + minutes
          const formattedDate = hours + ':' + minutes + label

          let shouldInsertDateBreak = false
          if (prevMessageMonth && prevMessageDate) {
            if (prevMessageMonth < month) shouldInsertDateBreak = true

            if (prevMessageMonth <= month && prevMessageDate < day) { shouldInsertDateBreak = true }
          }

          prevMessageMonth = month
          prevMessageDate = day

          const name =
            message.from === this.state.userSelected._id
              ? this.state.userSelected.name
              : this.props.user.name

          return (
            <div key={index}>
              {shouldInsertDateBreak && (
                <div className='message-date-break'>
                  <span>
                    {MONTHS[month]} {day}
                  </span>
                </div>
              )}

              <div className={classes}>
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
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    {name && <span className='message-name'>{name}</span>}
                    {name && <div className='message-name-break' />}
                    <span className='timestamp'>{formattedDate}</span>
                  </div>
                  <span>{message.message}</span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={this.chatBottom} />
      </div>
    )
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
              ref={this.chatInput}
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

const mapStateToProps = state => ({
  ...state
})

export default connect(mapStateToProps)(MessageBox)
