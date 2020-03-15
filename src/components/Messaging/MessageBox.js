import React, { Component } from 'react'
import io from 'socket.io-client'
import axios from 'axios'

import AttachmentInput from '../Attachment/Attachment'

import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

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
      conversationId: null,
      friendSearchInputText: '',
      friends: [],
      filteredFriends: [],
      attachmentInputShown: false,
      imageLoadedSrc: '',
      imageLoadedName: '',
      openImageViewer: false,
      imageViewerSrc: '',
      imageViewerName: ''
    }

    this.renderMessages = this.renderMessages.bind(this)
    this.handleSendMessage = this.handleSendMessage.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleSearchFriendListChange = this.handleSearchFriendListChange.bind(
      this
    )
    this.renderFilteredFriends = this.renderFilteredFriends.bind(this)
    this.handleToggleAttachmentInputShown = this.handleToggleAttachmentInputShown.bind(
      this
    )
    this.handleFileInput = this.handleFileInput.bind(this)
    this.handleDeleteImage = this.handleDeleteImage.bind(this)

    this.chatBottom = React.createRef()
    this.chatInput = React.createRef()
    this.newConversationInput = React.createRef()

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
        userSelected: this.props.userSelected
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
        () => {
          this.getConversationMessages()
          if (!this.state.userSelected) {
            this.newConversationInput.current.focus()
          }
        }
      )
    }

    if (prevState.friends !== this.state.friends) {
      this.setState({
        friends: this.state.friends
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.userSelected !== prevState.userSelected) {
      return { userSelected: nextProps.userSelected }
    } else if (nextProps.friends !== prevState.friends) {
      return { friends: nextProps.friends }
    } else return null
  }

  appendMessage (message) {
    if (
      message.conversation !== this.state.conversationId &&
      this.state.conversationId
    ) {
      return
    }

    const messages = [...this.state.messages]
    messages.push(message)
    this.setState(
      {
        messages: messages
      },
      () => {
        this.scrollIntoView(true)
        this.props.refreshConversationList()
      }
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

  handleSelectEmoji (e) {
    this.setState({
      messageInput: this.state.messageInput + e
    })
  }

  handleSendMessage (e) {
    if (e) e.preventDefault()

    if (!this.state.userSelected) return
    if (this.state.messageInput === '' && this.state.imageLoadedSrc === '') {
      return
    }

    const payload = {
      token: this.state.token,
      to: this.state.userSelected._id
    }

    if (this.state.messageInput !== '' && this.state.imageLoadedSrc === '') {
      payload.message = this.state.messageInput
      payload.type = 'message'
    }

    if (this.state.imageLoadedSrc !== '') {
      payload.imageSrc = this.state.imageLoadedSrc
      payload.imageAlt = this.state.imageLoadedName
      payload.type = 'image'
    }

    axios
      .post('/api/messages/sendMessage', payload)
      .then(() => {
        this.setState({
          messageInput: '',
          imageLoadedSrc: '',
          imageLoadedName: ''
        })
      })
      .catch(err => console.log(err))
  }

  handleSearchFriendListChange (e) {
    const value = e.target.value

    this.setState({
      friendSearchInputText: value
    })

    if (this.searchFriendListCallback) {
      clearTimeout(this.searchFriendListCallback)
    }

    if (this.state.friends.length <= 0) return

    if (value === '') return this.setState({ filteredFriends: [] })

    const callback = () => {
      const filteredFriends = this.state.friends.filter(friend => {
        return friend.name.toLowerCase().indexOf(value.toLowerCase()) !== -1
      })

      this.setState({
        filteredFriends: filteredFriends
      })

      delete this.searchFriendListCallback
    }

    this.searchFriendListCallback = setTimeout(callback, 500)
  }

  renderFilteredFriends () {
    if (this.state.filteredFriends.length <= 0) return

    return this.state.filteredFriends.map((friend, index) => {
      return (
        <div
          key={index}
          className='filtered-friend-row'
          onClick={this.handleCreateNewConversation.bind(this, friend)}
        >
          <span>{friend.name}</span>
        </div>
      )
    })
  }

  handleCreateNewConversation (friendSelected) {
    this.setState({
      filteredFriends: [],
      friendSearchInputText: ''
    })

    // Check if there is an existing conversation, if so use that
    this.setState({
      userSelected: friendSelected
    })

    this.props.selectUser(friendSelected)
  }

  toggleOpenImageViewer (message) {
    this.setState({
      openImageViewer: message !== null,
      imageViewerSrc: message === null ? '' : message.data,
      imageViewerName: message === null ? '' : message.name
    })
  }

  renderMessages () {
    if (!this.state.messages || !this.state.userSelected) return

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

            if (prevMessageMonth <= month && prevMessageDate < day) {
              shouldInsertDateBreak = true
            }
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
                  {message.type === 'message' && <span>{message.message}</span>}
                  {message.type === 'image' && (
                    <div className='message-image-wrapper'>
                      <img
                        src={message.data}
                        alt={message.name}
                        title={message.name}
                        onClick={this.toggleOpenImageViewer.bind(this, message)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={this.chatBottom} />
      </div>
    )
  }

  handleToggleAttachmentInputShown () {
    this.setState({
      attachmentInputShown: !this.state.attachmentInputShown
    })
  }

  handleFileInput (files) {
    // Save file
    if (files && files[0]) {
      const reader = new FileReader()
      reader.readAsDataURL(files[0])

      reader.onload = readerEvent => {
        this.setState({
          imageLoadedSrc: readerEvent.target.result,
          imageLoadedName: files[0].name
        })
        console.log(files[0].name)
      }
    }

    this.handleToggleAttachmentInputShown()
  }

  handleDeleteImage () {
    this.setState({
      imageLoadedSrc: '',
      imageLoadedName: ''
    })
  }

  render () {
    if (!this.state.userSelected) {
      return (
        <div className='message-box'>
          <div
            style={{ display: this.state.openImageViewer ? 'block' : 'none' }}
            className='image-viewer'
            onClick={this.toggleOpenImageViewer.bind(this, null)}
          >
            <div className='image-viewer-wrapper'>
              <img
                src={this.state.imageViewerSrc}
                alt={this.state.imageViewerName}
              />
              <span>{this.state.imageViewerName}</span>

              <div className='close-button'>
                <svg viewBox='0 0 24 24'>
                  <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                </svg>
              </div>
            </div>
          </div>

          <div
            style={{
              display: this.state.attachmentInputShown ? 'block' : 'none'
            }}
          >
            <AttachmentInput
              onCloseAttachment={this.handleToggleAttachmentInputShown}
              onFileInput={this.handleFileInput}
              isOpen={this.state.attachmentInputShown}
            />
          </div>

          <div className='friend-header-new'>
            <span>New message</span>

            <input
              type='text'
              placeholder='Start typing a name...'
              value={this.state.friendSearchInputText}
              onChange={this.handleSearchFriendListChange}
              ref={this.newConversationInput}
            />

            {this.state.filteredFriends.length > 0 && (
              <div className='search-results'>
                {this.renderFilteredFriends()}
              </div>
            )}
          </div>

          <div className='messages'>{this.renderMessages()}</div>

          <div className='message-cta-container'>
            <div className='message-input'>
              <div className='profile-img'>
                {this.props.user.profileImg ? (
                  <img
                    src={this.props.user.profileImg}
                    alt={this.props.user.name}
                  />
                ) : (
                  <svg viewBox='0 0 24 24'>
                    <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
                  </svg>
                )}
              </div>
              {this.state.imageLoadedSrc && this.state.imageLoadedName ? (
                <div className='message-input-image'>
                  <img
                    src={this.state.imageLoadedSrc}
                    alt={this.state.imageLoadedName}
                  />
                  <div className='message-input-image-title'>
                    <span>{this.state.imageLoadedName}</span>
                    <svg viewBox='0 0 24 24' onClick={this.handleDeleteImage}>
                      <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                    </svg>
                  </div>
                </div>
              ) : (
                <textarea
                  placeholder='Whats on your mind?'
                  onChange={this.handleInputChange}
                  value={this.state.messageInput}
                  onKeyDown={this.handleKeyPress}
                  ref={this.chatInput}
                />
              )}
            </div>

            <div className='message-cta'>
              <div
                className='attachment-wrapper'
                onClick={this.handleToggleAttachmentInputShown.bind(this)}
              >
                <svg viewBox='0 0 24 24'>
                  <path d='M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z' />
                </svg>
              </div>
              <div className='emoji-wrapper'>
                <svg viewBox='0 0 24 24'>
                  <path d='M12,17.5C14.33,17.5 16.3,16.04 17.11,14H6.89C7.69,16.04 9.67,17.5 12,17.5M8.5,11A1.5,1.5 0 0,0 10,9.5A1.5,1.5 0 0,0 8.5,8A1.5,1.5 0 0,0 7,9.5A1.5,1.5 0 0,0 8.5,11M15.5,11A1.5,1.5 0 0,0 17,9.5A1.5,1.5 0 0,0 15.5,8A1.5,1.5 0 0,0 14,9.5A1.5,1.5 0 0,0 15.5,11M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' />
                </svg>

                <div className='emoji-picker'>
                  <Picker
                    title={null}
                    showPreview={false}
                    showSkinTones={false}
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      right: '0px'
                    }}
                    onSelect={emoji => this.handleSelectEmoji(emoji.native)}
                  />
                </div>
              </div>
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

    return (
      <div className='message-box'>
        <div
          style={{ display: this.state.openImageViewer ? 'flex' : 'none' }}
          className='image-viewer'
          onClick={this.toggleOpenImageViewer.bind(this, null)}
        >
          <div className='image-viewer-wrapper'>
            <img
              src={this.state.imageViewerSrc}
              alt={this.state.imageViewerName}
            />
            <span>{this.state.imageViewerName}</span>

            <div className='close-button'>
              <svg viewBox='0 0 24 24'>
                <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
              </svg>
            </div>
          </div>
        </div>

        <div
          style={{
            display: this.state.attachmentInputShown ? 'block' : 'none'
          }}
        >
          <AttachmentInput
            onCloseAttachment={this.handleToggleAttachmentInputShown}
            onFileInput={this.handleFileInput}
            isOpen={this.state.attachmentInputShown}
          />
        </div>

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
              {this.props.user.profileImg ? (
                <img
                  src={this.props.user.profileImg}
                  alt={this.props.user.name}
                />
              ) : (
                <svg viewBox='0 0 24 24'>
                  <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
                </svg>
              )}
            </div>
            {this.state.imageLoadedSrc && this.state.imageLoadedName ? (
              <div className='message-input-image'>
                <img
                  src={this.state.imageLoadedSrc}
                  alt={this.state.imageLoadedName}
                />
                <div className='message-input-image-title'>
                  <span>{this.state.imageLoadedName}</span>
                  <svg viewBox='0 0 24 24' onClick={this.handleDeleteImage}>
                    <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                  </svg>
                </div>
              </div>
            ) : (
              <textarea
                placeholder='Whats on your mind?'
                onChange={this.handleInputChange}
                value={this.state.messageInput}
                onKeyDown={this.handleKeyPress}
                ref={this.chatInput}
              />
            )}
          </div>

          <div className='message-cta'>
            <div
              className='attachment-wrapper'
              onClick={this.handleToggleAttachmentInputShown.bind(this)}
            >
              <svg viewBox='0 0 24 24'>
                <path d='M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z' />
              </svg>
            </div>
            <div className='emoji-wrapper'>
              <svg viewBox='0 0 24 24'>
                <path d='M12,17.5C14.33,17.5 16.3,16.04 17.11,14H6.89C7.69,16.04 9.67,17.5 12,17.5M8.5,11A1.5,1.5 0 0,0 10,9.5A1.5,1.5 0 0,0 8.5,8A1.5,1.5 0 0,0 7,9.5A1.5,1.5 0 0,0 8.5,11M15.5,11A1.5,1.5 0 0,0 17,9.5A1.5,1.5 0 0,0 15.5,8A1.5,1.5 0 0,0 14,9.5A1.5,1.5 0 0,0 15.5,11M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' />
              </svg>

              <div className='emoji-picker'>
                <Picker
                  title={null}
                  showPreview={false}
                  showSkinTones={false}
                  style={{ position: 'absolute', bottom: '0px', right: '0px' }}
                  onSelect={emoji => this.handleSelectEmoji(emoji.native)}
                />
              </div>
            </div>
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
