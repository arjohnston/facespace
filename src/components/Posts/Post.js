import React, { Component } from 'react'
import './style.css'

// const profilePicture = null

export default class Post extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='post'>
        <div className='top-part'>
          {this.props.post.profileImg ? (
            <img src={this.props.post.profileImg} alt={this.props.post.name} />
          ) : (
            <svg viewBox='0 0 24 24' className='profile-temporary2'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>
          )}

          <div className='middle-top'>
            <div className='post-maker'>You wrote.</div>

            <div className='post-text'>{this.props.post.text}</div>
          </div>
        </div>

        <div className='post-picture'>
          <svg viewBox='0 0 24 24' className='picture-temporary' />
        </div>

        <div className='bottom-cta'>
          <div className='left-buttons'>
            <button>
              <svg viewBox='0 0 24 24'>
                <path d='M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67, 3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18, 21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z' />
              </svg>
              {this.props.post.likes ? this.props.post.likes : 0}{' '}
              {/* if null, 0 */}
            </button>

            <button>
              <svg viewBox='0 0 24 24'>
                <path d='M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20' />
              </svg>
              {this.props.post.comments ? this.props.post.comments.length : 0}
            </button>
          </div>

          <div className='right-buttons'>
            <button>
              <svg viewBox='0 0 24 24'>
                <path d='M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67, 3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18, 21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z' />
              </svg>
              Like
            </button>

            <button>
              <svg viewBox='0 0 24 24'>
                <path d='M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20' />
              </svg>
              Comment
            </button>

            <button>
              <svg viewBox='0 0 24 24'>
                <path d='M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z' />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    )
  }
}
