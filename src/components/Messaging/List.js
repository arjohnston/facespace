import React, { Component } from 'react'

import { connect } from 'react-redux'

import './style.css'

export class List extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeUser: null,
      searchText: '',
      friends: []
    }

    this.renderConversationList = this.renderConversationList.bind(this)
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this)
    this.handleCreateNewConversation = this.handleCreateNewConversation.bind(
      this
    )

    this.searchInputTextCallback = null
  }

  componentDidMount () {
    // This should be moved to query the DB for a list of friends
    // this.setState({
    //   friends: this.props.friends[0],
    //   userSelected:
    //     this.props.friends[0].length > 0 ? this.props.friends[0].data[0] : null
    // })
    // console.log('COMP ', this.props.friends)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.friends !== this.state.friends) {
      this.setState(
        {
          friends: this.state.friends
        },
        () => {
          if (this.state.activeUser === null && this.state.friends.length > 0) {
            this.activateUser(this.state.friends[0])
          }
        }
      )
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.friends !== prevState.friends) { return { friends: nextProps.friends } } else return null
  }

  handleCreateNewConversation () {
    this.activateUser(null)
  }

  activateUser (user) {
    this.setState({
      activeUser: user
    })

    this.props.selectUser(user)
  }

  handleSearchBarChange (e) {
    // Wait 1000ms after typing stops
    // Do a query & filter friends.
    // Search one friend at a time with their message history
    this.setState({
      searchText: e.target.value
    })

    if (this.searchMessagesInputTextCallback) { clearTimeout(this.searchMessagesInputTextCallback) }

    const callback = () => {
      console.log(this.state.friends)
      // do search stuff

      delete this.searchMessagesInputTextCallback
    }

    this.searchMessagesInputTextCallback = setTimeout(callback, 500)
  }

  renderConversationList () {
    if (!this.state.friends) return

    return this.state.friends.map((friend, index) => {
      let classes = 'friend-row'
      if (friend.online) classes += ' online'
      if (this.state.activeUser === friend) classes += ' active'

      return (
        <div
          className={classes}
          key={index}
          onClick={this.activateUser.bind(this, friend)}
        >
          <div className='friend-img-container'>
            {friend.profileImg ? (
              <img src={friend.profileImg} alt={friend.name || 'User'} />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}
          </div>
          <span>{friend.name || 'User'}</span>
        </div>
      )
    })
  }

  render () {
    return (
      <div className='friend-list-wrapper'>
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
          </div>
        </div>

        <div className='friend-list'>{this.renderConversationList()}</div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  ...state
})

export default connect(mapStateToProps)(List)
