import React, { Component } from 'react'

import './style.css'

export default class List extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userSelected: null,
      searchText: '',
      users: [],
      onlineUsers: [],
      mobileListOpen: false
    }

    this.renderConversationList = this.renderConversationList.bind(this)
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this)
    this.handleCreateNewConversation = this.handleCreateNewConversation.bind(
      this
    )
    this.handleMobileListShownToggle = this.handleMobileListShownToggle.bind(this)

    this.searchInputTextCallback = null
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.userSelected !== this.state.userSelected) {
      this.setState({
        userSelected: this.state.userSelected
      })
    }

    if (prevState.users !== this.state.users) {
      this.setState(
        {
          users: this.state.users
        },
        () => {
          if (this.state.userSelected === null && this.state.users.length > 0) {
            if (window && window.innerWidth < 767) return

            this.activateUser(this.state.users[0])
          }
        }
      )
    }

    if (prevState.onlineUsers !== this.state.onlineUsers) {
      this.setState({
        onlineUsers: this.state.onlineUsers
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.userSelected !== prevState.userSelected) {
      return { userSelected: nextProps.userSelected }
    } else if (nextProps.users !== prevState.users) {
      return { users: nextProps.users }
    } else if (nextProps.onlineUsers !== prevState.onlineUsers) {
      return { onlineUsers: nextProps.onlineUsers }
    } else return null
  }

  handleCreateNewConversation () {
    this.props.createNewConversation()

    this.setState({
      userSelected: null
    })
  }

  activateUser (user) {
    this.setState({
      userSelected: user
    })

    this.handleMobileListShownToggle()
    this.props.selectUser(user)
  }

  handleSearchBarChange (e) {
    // Wait 500ms after typing stops
    // Do a query & filter friends.
    // Search one friend at a time with their message history
    this.setState({
      searchText: e.target.value
    })

    if (this.searchMessagesInputTextCallback) {
      clearTimeout(this.searchMessagesInputTextCallback)
    }

    const callback = () => {
      // do search stuff

      delete this.searchMessagesInputTextCallback
    }

    this.searchMessagesInputTextCallback = setTimeout(callback, 500)
  }

  handleMobileListShownToggle () {
    this.setState({
      mobileListOpen: !this.state.mobileListOpen
    })
  }

  renderConversationList () {
    if (!this.state.users) return

    return this.state.users.map((friend, index) => {
      let classes = 'friend-row'
      if (this.state.onlineUsers && this.state.onlineUsers.map((user) => user.userId).includes(friend._id)) classes += ' online'

      if (this.state.userSelected === friend) classes += ' active'

      return (
        <div
          className={classes}
          key={index}
          onClick={this.activateUser.bind(this, friend)}
        >
          <div className='friend-img-container'>
            {friend.profileImg ? (
              <img src={friend.profileImg} alt={`${friend.firstName} ${friend.lastName}` || 'User'} />
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

  render () {
    return (
      <div className={`friend-list-wrapper${!this.state.mobileListOpen ? ' mobile-closed' : ''}`}>
        <div className='friend-list-cta-wrapper'>
          <div className='friend-list-title-wrapper'>
            <span className='friend-list-title'>Messaging</span>
            <div
              className='create-new-conversation'
              onClick={this.handleCreateNewConversation}
            >
              <svg viewBox='0 0 24 24'>
                <path d='M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M8,18H12.1L13,17.1V16H8V18M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z' />
              </svg>
            </div>
            {/* <div className='mobile-list-chevron' onClick={this.handleMobileListShownToggle}>
              <svg viewBox='0 0 24 24'>
                <path d='M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z' />
              </svg>
            </div> */}
          </div>
          <div className='search-bar'>
            <label htmlFor='friend-search'>
              <svg viewBox='0 0 24 24'>
                <path d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' />
              </svg>
            </label>
            <input
              type='text'
              placeholder='Search messages'
              name='friend-search'
              id='friend-search'
              onChange={this.handleSearchBarChange}
              value={this.state.searchText}
            />

            {/* <div
              className='mobile-create-new-conversation'
              onClick={this.handleCreateNewConversation}
            >
              <svg viewBox='0 0 24 24'>
                <path d='M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M8,18H12.1L13,17.1V16H8V18M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z' />
              </svg>
            </div> */}
          </div>
        </div>

        <div className='friend-list'>{this.renderConversationList()}</div>
      </div>
    )
  }
}
