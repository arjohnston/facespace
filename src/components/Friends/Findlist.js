import React, { Component } from 'react'
import './style.css'

const array = [
  {
    name: 'Cookie Monster',
    img: null
  },
  {
    name: 'Cookie Monster',
    img: null
  },
  {
    name: 'Cookie Monster',
    img: null
  },
  {
    name: 'Cookie Monster',
    img: null
  },
  {
    name: 'Cookie Monster',
    img: null
  }
]

export default class FindList extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.renderFinders = this.renderFinders.bind(this)
    this.renderSearch = this.renderSearch.bind(this)
  }

  renderFinders () {
    return array.map((finder, index) => {
      return (
        <div className='usercard' key={index}>
          {finder.img ? (
            <img src={finder.img} alt={finder.name} />
          ) : (
            <svg viewBox='0 0 24 24'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>
          )}
          <span>{finder.name}</span>
          <button type='submit'>Request Friendship</button>
        </div>
      )
    })
  }

  renderSearch () {
    return (
      <div className='friendlistsearch-bar'>
        <label htmlFor='friend-search'>
          <svg viewBox='0 0 24 24'>
            <path d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' />
          </svg>
        </label>
        <input
          type='text'
          placeholder='Search for friend....'
          name='friend-search'
          id='myInput'
          onChange={this.handleSearchBarChange}
          value={this.state.searchText}
        />
      </div>
    )
  }

  render () {
    return (
      <div className='finder-list-container'>
        {this.renderSearch()}

        {this.renderFinders()}
      </div>
    )
  }
}
