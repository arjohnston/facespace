import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { connect } from 'react-redux'
import { Picker } from 'emoji-mart'
import AttachmentInput from '../Attachment/Attachment'

import {
  sendSocketMessage
} from '../../actions/index'

import './style.css'

export class Messenger extends Component {
  constructor (props) {
    super(props)
    this.state = {
      listMinimized: true,
      messagesMinimized: true,
      userSelected: null,
      onlineUsers: [],
      users: [],
      filteredUsers: [],
      searchText: '',
      messages: [],
      messageInput: '',
      imageLoadedSrc: '',
      imageLoadedName: '',
      attachmentInputShown: false,
      openImageViewer: false,
      imageViewerSrc: '',
      imageViewerName: '',
      creatingNewConversation: false,
      creatingNewConversationInputText: '',
      filteredFriendsForNewConversation: [],
      emojiMenuOpen: false
    }

    this.handleCreateNewConversation = this.handleCreateNewConversation.bind(this)
    this.handleCreateNewConversationInput = this.handleCreateNewConversationInput.bind(this)
    this.handleClearSearchText = this.handleClearSearchText.bind(this)
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this)
    this.handleCloseMessages = this.handleCloseMessages.bind(this)
    this.handleMinimizeMenus = this.handleMinimizeMenus.bind(this)

    this.renderMessages = this.renderMessages.bind(this)
    this.handleSendMessage = this.handleSendMessage.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)

    this.handleToggleAttachmentInputShown = this.handleToggleAttachmentInputShown.bind(
      this
    )
    this.handleFileInput = this.handleFileInput.bind(this)
    this.handleDeleteImage = this.handleDeleteImage.bind(this)

    this.handleEmojiMouseEnter = this.handleEmojiMouseEnter.bind(this)
    this.handleEmojiMouseLeave = this.handleEmojiMouseLeave.bind(this)

    this.messengerChatBottom = React.createRef()
  }

  componentDidMount () {
    this.getConversationList(this.props.token)
    this.getConversationMessages()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.onlineUsers !== this.state.onlineUsers) {
      this.setState({
        onlineUsers: this.state.onlineUsers
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.onlineUsers !== prevState.onlineUsers) {
      return { onlineUsers: nextProps.onlineUsers }
    } else return null
  }

  
  handleMinimizeMenus () {
    this.setState({
      messagesMinimized: true,
      listMinimized: true
    })
  }

  handleCreateNewConversation (e) {
    e.stopPropagation()

    this.setState({
      userSelected: null,
      messagesMinimized: false,
      creatingNewConversation: true
    })
  }

  handleCreateNewConversationInput (e) {
    const value = e.target.value

    this.setState({
      creatingNewConversationInputText: value
    })

    if (this.searchFriendListCallback) {
      clearTimeout(this.searchFriendListCallback)
    }

    if (this.props.friends.length <= 0) return

    if (value === '') return this.setState({ filteredFriends: [] })

    const callback = () => {
      const filteredFriends = this.props.friends.filter(friend => {
        const name = friend.firstName + ' ' + friend.lastName
        return name.toLowerCase().indexOf(value.toLowerCase()) !== -1
      })

      this.setState({
        filteredFriendsForNewConversation: filteredFriends
      })

      delete this.searchFriendListCallback
    }

    this.searchFriendListCallback = setTimeout(callback, 500)
  }

  handleCloseMessages (e) {
    e.stopPropagation()

    this.setState({
      userSelected: null,
      messagesMinimized: true,
      creatingNewConversation: false,
      creatingNewConversationInputText: '',
      filteredFriendsForNewConversation: []
    })
  }

  handleSearchBarChange (e) {
    const searchText = e.target.value
    // Wait 500ms after typing stops
    // Do a query & filter friends.
    // Search one friend at a time with their message history
    this.setState({
      searchText: searchText
    })

    if (this.searchMessagesInputTextCallback) {
      clearTimeout(this.searchMessagesInputTextCallback)
    }

    const callback = async () => {
      const users = [...this.state.users]
      const filteredUsers = []
      const promises = []

      for (const user in users) {
        promises.push(
          new Promise((resolve, reject) => {
            const name = users[user].firstname + ' ' + users[user].lastName

            if (name.toLowerCase().includes(searchText.toLowerCase())) {
              filteredUsers.push(users[user])
              return resolve()
            }

            axios
              .post('/api/messages/getConversationMessages', {
                token: this.props.token,
                userId: users[user]._id
              })
              .then(res => {
                if (
                  res.data.some(msg =>
                    msg.type === 'message'
                      ? msg.message
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                      : false
                  )
                ) {
                  filteredUsers.push(users[user])

                  resolve()
                } else {
                  resolve()
                }
              })
              .catch(err => {
                reject(err)
              })
          })
        )
      }

      Promise.all(promises).then(() => {
        this.setState({
          filteredUsers: filteredUsers
        })

        delete this.searchMessagesInputTextCallback
      })
    }

    this.searchMessagesInputTextCallback = setTimeout(callback, 500)
  }

  handleClearSearchText () {
    this.setState({
      searchText: '',
      filteredUsers: []
    })
  }

  activateUser (user) {
    this.setState({
      userSelected: user,
      messagesMinimized: false
    }, () => this.getConversationMessages())
  }

  getConversationList (token) {
    axios
      .post('/api/messages/getConversationList', { token: token })
      .then(res => {
        const users = []

        for (const obj in res.data) {
          for (const recipient in res.data[obj].recipientObj) {
            if (
              res.data[obj].recipientObj[recipient].email !==
              this.props.user.email
            ) {
              res.data[obj].recipientObj[recipient].lastMessage =
                res.data[obj].lastMessage
              res.data[obj].recipientObj[recipient].lastMessageDate =
                res.data[obj].date
              users.push(res.data[obj].recipientObj[recipient])
            }
          }
        }

        users
          .sort(
            (a, b) =>
              new Date(a.lastMessageDate).getTime() -
              new Date(b.lastMessageDate).getTime()
          )
          .reverse()

        this.setState({
          users: users
        })
      })
      .catch(err => console.log(err))
  }

  renderConversationList () {
    if (!this.state.users) return

    const users =
      this.state.filteredUsers.length > 0
        ? [...this.state.filteredUsers]
        : [...this.state.users]

    return users.map((friend, index) => {
      let classes = 'friend-row'
      if (
        this.state.onlineUsers &&
        this.state.onlineUsers.map(user => user.userId).includes(friend._id)
      ) { classes += ' online' }

      if (this.state.userSelected === friend) classes += ' active'

      return (
        <div
          className={classes}
          key={index}
          onClick={this.activateUser.bind(this, friend)}
        >
          <div className='friend-img-container'>
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
          </div>
          <div className='friend-row-meta'>
            <span>{`${friend.firstName} ${friend.lastName}` || 'User'}</span>
            <span>{friend.lastMessage}</span>
          </div>
        </div>
      )
    })
  }

  appendMessage (message) {
    if (
      message.conversation !== this.state.conversationId &&
      this.state.conversationId
    ) {
      return
    }

    this.setState(
      {
        messages: [...this.state.messages, message]
      },
      () => {
        this.scrollIntoView(true)
      }
    )
  }

  getConversationMessages () {
    if (!this.state.userSelected) return

    axios
      .post('/api/messages/getConversationMessages', {
        token: this.props.token,
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
          }
        )
      })
      .catch(err => console.log(err))
  }

  scrollIntoView (effect) {
    if (!this.messengerChatBottom.current) return
    if (!this.state.userSelected) return

    if (effect) {
      return this.messengerChatBottom.current.scrollIntoView({ behavior: 'smooth' })
    }

    if (window && window.innerWidth < 767) {
      setTimeout(() => {
        this.messengerChatBottom.current.scrollIntoView()
      }, 300)
    } else {
      this.messengerChatBottom.current.scrollIntoView()
    }
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
      messageInput: this.state.messageInput + e,
      emojiMenuOpen: false
    })
  }

  handleEmojiMouseEnter () {
    this.setState({
      emojiMenuOpen: true
    })
  }

  handleEmojiMouseLeave () {
    this.setState({
      emojiMenuOpen: false
    })
  }

  handleSendMessage (e) {
    if (e) e.preventDefault()

    if (!this.state.userSelected) return
    if (this.state.messageInput === '' && this.state.imageLoadedSrc === '') {
      return
    }

    const payload = {
      token: this.props.token,
      to: this.state.userSelected._id
    }

    if (this.state.messageInput !== '' && this.state.imageLoadedSrc === '') {
      payload.message = this.state.messageInput
      payload.type = 'message'
    }

    if (this.state.imageLoadedSrc !== '') {
      payload.data = this.state.imageLoadedSrc
      payload.name = this.state.imageLoadedName
      payload.type = 'image'
    }

    axios
      .post('/api/messages/sendMessage', payload)
      .then((res) => {
        this.setState({
          messageInput: '',
          imageLoadedSrc: '',
          imageLoadedName: ''
        })

        payload.conversation = res.data.conversationId
        payload.date = Date.now()
        payload.from = this.props.user.userId
        delete payload.token

        this.props.sendSocketMessage(payload)
        this.appendMessage(payload)
      })
      .catch(err => console.log(err))
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
          if (hours === 0) hours = 12
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
              ? this.state.userSelected.firstName + ' ' + this.state.userSelected.lastName
              : this.props.user.firstName + ' ' + this.props.user.lastName

          const profileImg = message.from === this.state.userSelected._id
            ? this.state.userSelected.profileImg
            : this.props.user.profileImg

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
                  {profileImg ? (
                    <img
                      src={profileImg}
                      alt={name}
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

        <div ref={this.messengerChatBottom} />
      </div>
    )
  }

  toggleOpenImageViewer (message) {
    this.setState({
      openImageViewer: message !== null,
      imageViewerSrc: message === null ? '' : message.data,
      imageViewerName: message === null ? '' : message.name
    })
  }

  handleDeleteImage () {
    this.setState({
      imageLoadedSrc: '',
      imageLoadedName: ''
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
      }
    }

    this.handleToggleAttachmentInputShown()
  }

  handleToggleAttachmentInputShown () {
    this.setState({
      attachmentInputShown: !this.state.attachmentInputShown
    })
  }

  handleSelectNewConversation (friend, e) {
    e.stopPropagation()

    this.setState({
      userSelected: friend,
      creatingNewConversation: false,
      creatingNewConversationInputText: '',
      filteredFriendsForNewConversation: [],
      messagesMinimized: false
    }, () => this.getConversationMessages())
  }

  renderFilteredFriendsForNewConversation () {
    if (this.state.filteredFriendsForNewConversation.length <= 0) return

    return this.state.filteredFriendsForNewConversation.map((friend, index) => {
      return (
        <div
          key={index}
          className='filtered-friend-row'
          onClick={this.handleSelectNewConversation.bind(this, friend)}
        >
          <span>{`${friend.firstName} ${friend.lastName}`}</span>
        </div>
      )
    })
  }

  render () {
    return (
      <div>
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

        <div className='messenger-container'>
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

          <div
            style={{ display: this.state.userSelected || this.state.creatingNewConversation ? 'flex' : 'none' }}
            className={`messenger-messages ${this.state.messagesMinimized ? 'minimized' : ''}`}
          >

            <div
              className='messenger-header'
              onClick={() => this.setState({ messagesMinimized: !this.state.messagesMinimized })}
            >
              {!this.state.creatingNewConversation && (
                <div className='profile-img'>
                  {this.state.userSelected && this.state.userSelected.profileImg ? (
                    <img
                      src={this.state.userSelected.profileImg}
                      alt={`${this.state.userSelected.firstName} ${this.state.userSelected.lastName}`}
                    />
                  ) : (
                    <svg viewBox='0 0 24 24'>
                      <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
                    </svg>
                  )}
                </div>
              )}

              {this.state.creatingNewConversation
                ? (
                  <label htmlFor='new-conversation' onClick={(e) => e.stopPropagation()}>
                    <svg viewBox='0 0 24 24'>
                      <path d='M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M8,18H12.1L13,17.1V16H8V18M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z' />
                    </svg>
                    <input
                      placeholder='Start typing a name...'
                      name='new-conversation'
                      id='new-conversation'
                      value={this.state.creatingNewConversationInputText}
                      onChange={this.handleCreateNewConversationInput}
                    />
                  </label>
                )
                : (
                  this.state.userSelected
                    ? (
                      <Link to={`/user/${this.state.userSelected.username}`}>
                        <span onClick={this.handleMinimizeMenus}>{this.state.userSelected.firstName + ' ' + this.state.userSelected.lastName}</span>
                      </Link>
                    )
                    : <span>Conversation</span>
                )}

              <div className='messenger-header-cta-wrapper'>
                {!this.state.creatingNewConversation && (
                  <div className='messenger-chevron'>
                    <svg viewBox='0 0 24 24'>
                      <path d='M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z' />
                    </svg>
                  </div>
                )}

                <div
                  className='conversation-close'
                  onClick={this.handleCloseMessages}
                >
                  <svg viewBox='0 0 24 24'>
                    <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                  </svg>
                </div>
              </div>

              {this.state.filteredFriendsForNewConversation.length > 0 && (
                <div className='search-results'>
                  {this.renderFilteredFriendsForNewConversation()}
                </div>
              )}
            </div>

            <div className='messages'>{this.renderMessages()}</div>

            <div className='message-cta-container'>
              <div className='message-input'>
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
                <div className={`emoji-wrapper ${this.state.emojiMenuOpen ? 'is-open' : ''}`} onMouseEnter={this.handleEmojiMouseEnter} onMouseLeave={this.handleEmojiMouseLeave}>
                  <svg viewBox='0 0 24 24'>
                    <path d='M12,17.5C14.33,17.5 16.3,16.04 17.11,14H6.89C7.69,16.04 9.67,17.5 12,17.5M8.5,11A1.5,1.5 0 0,0 10,9.5A1.5,1.5 0 0,0 8.5,8A1.5,1.5 0 0,0 7,9.5A1.5,1.5 0 0,0 8.5,11M15.5,11A1.5,1.5 0 0,0 17,9.5A1.5,1.5 0 0,0 15.5,8A1.5,1.5 0 0,0 14,9.5A1.5,1.5 0 0,0 15.5,11M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' />
                  </svg>

                  <div className='emoji-picker'>
                    <Picker
                      title={null}
                      showPreview={false}
                      showSkinTones={false}
                      style={{ position: 'absolute', bottom: '0px', right: '0px' }}
                      onClick={emoji => this.handleSelectEmoji(emoji.native)}
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

          <div
            className={`messenger-friend-list ${this.state.listMinimized ? 'minimized' : ''}`}
          >
            <div className='messenger-header' onClick={() => this.setState({ listMinimized: !this.state.listMinimized })}>
              <div className='profile-img'>
                {this.props.user && this.props.user.profileImg ? (
                  <img
                    src={this.props.user.profileImg}
                    alt={`${this.props.user.firstName} ${this.props.user.lastName}`}
                  />
                ) : (
                  <svg viewBox='0 0 24 24'>
                    <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
                  </svg>
                )}
              </div>

              <span>Messenger</span>

              <div className='messenger-header-cta-wrapper'>
                <div
                  className='create-new-conversation'
                  onClick={this.handleCreateNewConversation}
                >
                  <svg viewBox='0 0 24 24'>
                    <path d='M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M8,18H12.1L13,17.1V16H8V18M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z' />
                  </svg>
                </div>

                <div className='messenger-chevron'>
                  <svg viewBox='0 0 24 24'>
                    <path d='M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z' />
                  </svg>
                </div>
              </div>
            </div>

            <div className='search-bar'>
              <label htmlFor='friend-search-messenger'>
                <svg viewBox='0 0 24 24'>
                  <path d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' />
                </svg>
              </label>
              <input
                type='text'
                placeholder='Search messages'
                name='friend-search-messenger'
                id='friend-search-messenger'
                onChange={this.handleSearchBarChange}
                value={this.state.searchText}
              />

              <div
                className={`clear-search-bar ${
                  this.state.searchText.length > 0 ? 'is-active' : ''
                }`}
                onClick={this.handleClearSearchText}
              >
                <svg viewBox='0 0 24 24'>
                  <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                </svg>
              </div>
            </div>

            <div className='friend-list'>{this.renderConversationList()}</div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  ...state
})

const mapDispatchToProps = dispatch => ({
  sendSocketMessage: payload => dispatch(sendSocketMessage(payload))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Messenger)
