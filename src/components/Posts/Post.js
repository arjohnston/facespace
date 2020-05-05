import React, { Component } from 'react'
import './style.css'
import axios from 'axios'
import { connect } from 'react-redux'

export class Post extends Component {
  constructor (props) {
    super(props)
    this.state = {
      commentsOpen: false,
      commentText: '',
      comments: [],
      likes: 0
    }
    this.handleToggleCommentsOpen = this.handleToggleCommentsOpen.bind(this)
    this.handleCommentTextChange = this.handleCommentTextChange.bind(this)
    this.handleCommentPost = this.handleCommentPost.bind(this)
    this.handleToggleLike = this.handleToggleLike.bind(this)
  }

  componentDidMount () {
    this.setState({
      comments: this.props.post.comments,
      likes: this.props.post.likes,
      post: this.props.post,
      openImageViewer: false
    })

    this.loadUser()

    console.log(this.props)
  }

  handleToggleLike () {
    let likes = this.state.likes
    likes++

    this.setState(
      {
        likes: likes
      },
      () => {
        axios
          .post('/api/posts/edit', {
            token: this.props.token,
            postId: this.props.post._id,
            likes: this.state.likes
          })
          .catch(error => {
            // if err statusCode == 401, then remove token & push /login
            // otherwise log the token
            console.log(error)
          })
      }
    )
  }

  handleCommentTextChange (event) {
    this.setState({
      commentText: event.target.value
    })
  }

  // function for creating post
  handleCommentPost () {
    const comment = {
      text: this.state.commentText,
      authorId: this.props.user.userId,
      author: this.props.user.firstName + ' ' + this.props.user.lastName
    }

    const comments = [...this.state.comments]
    comments.push(comment)

    this.setState({
      commentText: '',
      comments: comments
    })

    axios
      .post('/api/posts/edit', {
        token: this.props.token,
        postId: this.props.post._id,
        comments: comments
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  renderComment () {
    if (!this.state.comments) return
    return (
      <div className='comment-area'>
        {this.state.comments.map((comment, index) => {
          return (
            <div className='comment-comment' key={index}>
              <span className='comment'>
                {comment.author ? comment.author : 'User'}: {comment.text}
              </span>
            </div>
          )
        })}

        <div className='comment-input'>
          <textarea
            className='comment-fill-area'
            placeholder='What would you like to say?'
            value={this.state.commentText}
            onChange={this.handleCommentTextChange}
          />
          <input
            onClick={this.handleCommentPost}
            type='submit'
            value='Comment'
            className='comment-button'
          />
        </div>
      </div>
    )
  }

  handleToggleCommentsOpen () {
    this.setState({
      commentsOpen: !this.state.commentsOpen
    })
  }

  loadUser () {
    if (this.props.user.userId === this.props.post.user) return

    axios
      .post('/api/posts/getUser', {
        token: this.props.token,
        userId: this.props.post.user
      })
      .then(res => {
        this.setUser(
          res.data.firstName,
          res.data.lastName,
          res.data.username,
          res.data.profileImg,
          res.data.email,
          res.data.id
        )
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  setUser (firstName, lastName, username, profileImg, email, id) {
    this.setState({
      firstName: firstName,
      lastName: lastName,
      username: username,
      profileImg: profileImg,
      email: email,
      userId: id
    })
  }

  toggleOpenImageViewer () {
    this.setState({
      openImageViewer: !this.state.openImageViewer
    })
  }

  render () {
    let author = ''
    if (this.props.user.userId === this.props.post.user) {
      author = 'You'
    } else {
      author = this.state.firstName + ' ' + this.state.lastName
    }

    return (
      <div className='post'>
        <div
          style={{ display: this.state.openImageViewer ? 'flex' : 'none' }}
          className='image-viewer'
          onClick={this.toggleOpenImageViewer.bind(this)}
        >
          <div className='image-viewer-wrapper'>
            <img
              src={this.props.post.imageData}
              alt={this.props.post.imageName}
            />
            <span>{this.props.post.imageName}</span>

            <div className='close-button'>
              <svg viewBox='0 0 24 24'>
                <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
              </svg>
            </div>
          </div>
        </div>

        <div className='top-part'>
          <div className='post-profile-img'>
            {this.state.profileImg ? (
              <img
                src={this.state.profileImg}
                alt={this.state.firstName + ' ' + this.state.lastName}
              />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}
          </div>

          <div className='middle-top'>
            <span className='post-maker'>
              <span>{author}</span> wrote:
            </span>
            <span className='post-text'>{this.props.post.text}</span>

            {this.props.post.imageData && (
              <div className='post-picture'>
                <img
                  src={this.props.post.imageData}
                  alt={this.props.post.imageName}
                  onClick={this.toggleOpenImageViewer.bind(this)}
                />
              </div>
            )}
          </div>
        </div>

        <div className='bottom-cta'>
          <div className='left-buttons'>
            <div className='cta-button'>
              <svg viewBox='0 0 24 24'>
                <path d='M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67, 3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18, 21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z' />
              </svg>
              {this.state.likes}
            </div>

            <div className='cta-button'>
              <svg viewBox='0 0 24 24'>
                <path d='M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20' />
              </svg>
              {this.state.comments ? this.state.comments.length : 0}
            </div>
          </div>

          <div className='right-buttons'>
            <button onClick={this.handleToggleLike}>
              <svg viewBox='0 0 24 24'>
                <path d='M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67, 3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18, 21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z' />
              </svg>
              Like
            </button>

            <button onClick={this.handleToggleCommentsOpen}>
              <svg viewBox='0 0 24 24'>
                <path d='M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20' />
              </svg>
              Comment
            </button>

            {this.props.user.userId !== this.props.post.user && (
              <button>
                <svg viewBox='0 0 24 24'>
                  <path d='M21,12L14,5V9C7,10 4,15 3,20C5.5,16.5 9,14.9 14,14.9V19L21,12Z' />
                </svg>
                Share
              </button>
            )}
          </div>
        </div>

        <div className={`comments ${this.state.commentsOpen ? 'is-open' : ''}`}>
          {this.renderComment()}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  ...state
})

export default connect(mapStateToProps)(Post)
