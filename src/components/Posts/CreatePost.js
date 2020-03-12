import React, { Component } from 'react'
import './style.css'

const profilePicture = null

export default class CreatePost extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='create-post-container'>
        <div className='create-post-input'>
          {profilePicture ? (
            <img src={profilePicture} alt='Cookie Monster' />
          ) : (
            <svg viewBox='0 0 24 24' className='profile-temporary'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>
          )}

          <svg viewBox='0 0 24 24'>
            <path d='M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M8,18H12.1L13,17.1V16H8V18M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z' />
          </svg>

          <textarea placeholder='Whats on your mind?' />
        </div>

        <div className='create-post-cta'>
          <input
            type='submit'
            value='Post'
            className='create-post-submit-button'
          />
        </div>
      </div>
    )
  }
}
