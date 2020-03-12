import React, { Component } from 'react'

import './style.css'

export default class List extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeUser: null,
      searchText: '',
      users: null
    }

    this.renderUserList = this.renderUserList.bind(this)
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this)
  }

  componentDidMount () {
    // This should be moved to query the DB for a list of friends
    this.setState({
      users: this.props.users,
      userSelected:
        this.props.users.length > 0 ? this.props.users.data[0] : null
    })
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.users !== this.state.users) {
      this.setState(
        {
          users: this.state.users
        },
        () => {
          if (this.state.activeUser === null && this.state.users.length > 0) {
            this.activateUser(this.state.users[0])
          }
        }
      )
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.users !== prevState.users) return { users: nextProps.users }
    else return null
  }

  activateUser (user) {
    this.setState({
      activeUser: user
    })

    this.props.selectUser(user)
  }

  handleSearchBarChange (e) {
    this.setState({
      searchText: e.target.value
    })

    // Wait 1000ms after typing stops
    // Do a query & filter friends.
    // Search one friend at a time with their message history
  }

  renderUserList () {
    if (!this.state.users) return

    return this.state.users.map((user, index) => {
      let classes = 'friend-row'
      if (user.online) classes += ' online'
      if (this.state.activeUser === user) classes += ' active'

      return (
        <div
          className={classes}
          key={index}
          onClick={this.activateUser.bind(this, user)}
        >
          <div className='friend-img-container'>
            {user.profileImg ? (
              <img src={user.profileImg} alt={user.name || 'User'} />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}
          </div>
          <span>{user.name || 'User'}</span>
        </div>
      )
    })
  }

  render () {
    return (
      <div className='friend-list-wrapper'>
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
        <div className='friend-list'>{this.renderUserList()}</div>
      </div>
    )
  }
}
