import React, { Component } from 'react'
import axios from 'axios'
import './style.css'

export default class FindList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      nonFriends: [],
      filteredNonFriends: [],
      friendSearchInputText: ''
    }
    this.renderFinders = this.renderFinders.bind(this)
    this.handleSearchFriendListChange = this.handleSearchFriendListChange.bind(
      this
    )
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.nonFriends !== this.state.nonFriends) {
      this.setState({
        nonFriends: this.state.nonFriends
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.nonFriends !== prevState.nonFriends) {
      return { nonFriends: nextProps.nonFriends }
    } else return null
  }

  handleAddFriendRequest (id) {
    axios
      .post('/api/friends/addFriendRequest', {
        token: this.props.token,
        friendId: id
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  handleSearchFriendListChange (e) {
    const value = e.target.value

    this.setState({
      friendSearchInputText: value
    })

    if (this.searchFriendListCallback) {
      clearTimeout(this.searchFriendListCallback)
    }

    if (this.state.nonFriends.length <= 0) return

    if (value === '') return this.setState({ filteredNonFriends: [] })

    const callback = () => {
      const filteredNonFriends = this.state.nonFriends.filter(friend => {
        const name = friend.firstName + ' ' + friend.lastName
        return name.toLowerCase().indexOf(value.toLowerCase()) !== -1
      })

      this.setState({
        filteredNonFriends: filteredNonFriends
      })

      delete this.searchFriendListCallback
    }

    this.searchFriendListCallback = setTimeout(callback, 500)
  }

  renderFinders () {
    const nonFriends =
      this.state.filteredNonFriends.length > 0
        ? this.state.filteredNonFriends
        : this.state.nonFriends

    return nonFriends.map((finder, index) => {
      return (
        <div className='usercard' key={index}>
          <div className='usercard-profile-img'>
            {finder.profileImg ? (
              <img
                src={finder.profileImg}
                alt={finder.firstName + ' ' + finder.lastName}
              />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}
          </div>
          <span>{finder.firstName + ' ' + finder.lastName}</span>
          <button
            type='submit'
            onClick={this.handleAddFriendRequest.bind(this, finder._id)}
          >
            + Add Friend
          </button>
        </div>
      )
    })
  }

  render () {
    return (
      <div className='finder-list-container'>
        <div className='friendlistsearch-bar'>
          <label htmlFor='friend-search'>
            <svg viewBox='0 0 24 24'>
              <path d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' />
            </svg>
          </label>
          <input
            type='text'
            placeholder='Search for friend...'
            name='friend-search'
            id='friend-search'
            onChange={this.handleSearchFriendListChange}
            value={this.state.friendSearchInputText}
          />
        </div>

        {this.renderFinders()}
      </div>
    )
  }
}
