import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import axios from 'axios'

// import ProfileHeader from '../components/Profile/ProfileHeader'
import ProfileManagement from '../components/Profile/ProfileManagement'
import Post from '../components/Posts/Post'

export class Profile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: null,
      posts: [],
      popupOpen: false,
      isEditable: false,
      biography: ''
    }

    this.handleBiographyChange = this.handleBiographyChange.bind(this)
    this.getUser = this.getUser.bind(this)
    this.reloadWindow = this.reloadWindow.bind(this)
  }

  componentDidMount () {
    document.title = 'Profile | myface'

    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    this.setState(
      {
        token: token,
        username: this.props.location
          ? this.props.location.pathname.split('/user/').pop()
          : null
      },
      () => {
        this.getPosts()
        this.getUser()
      }
    )
  }

  getUser () {
    axios
      .post('/api/auth/getUser', {
        token: this.state.token,
        username: this.state.username
      })
      .then(res => {
        this.setState({
          user: res.data,
          isEditable: res.data.id === this.props.user.userId,
          biography: res.data.biography
        })
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  getPosts () {
    axios
      .post('/api/posts/getPosts', {
        token: this.state.token,
        username: this.state.username
      })
      .then(res => {
        this.setState({
          posts: res.data
        })
      })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  handleTogglePopupOpen () {
    this.setState({
      popupOpen: !this.state.popupOpen
    })
  }

  renderPosts () {
    if (this.state.posts.length <= 0) return
    return this.state.posts.map((post, index) => {
      return (
        <div className='post-container' key={index}>
          <Post post={post} token={this.state.token} />
        </div>
      )
    })
  }

  handleBiographyChange (event) {
    const value = event.target.value

    this.setState({
      biography: event.target.value
    })

    if (this.biographyUpdateCallback) {
      clearTimeout(this.biographyUpdateCallback)
    }

    const callback = () => {
      if (value !== this.state.biography) {
        axios
          .post('/api/auth/edit', {
            token: this.state.token,
            biography: value
          })
          .catch(error => {
            console.log(error)
          })
      }

      delete this.biographyUpdateCallback
    }

    this.biographyUpdateCallback = setTimeout(callback, 1000)
  }

  reloadWindow () {
    if (window) window.location.reload()
  }

  render () {
    return (
      <div className='profile-wrapper'>
        <div>
          <div className='profile-image'>
            {this.state.user && this.state.user.profileImg ? (
              <img
                src={this.state.user.profileImg}
                alt={this.state.user.firstName + ' ' + this.state.user.lastName}
              />
            ) : (
              <svg viewBox='0 0 24 24'>
                <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
              </svg>
            )}
          </div>

          {this.state.isEditable && (
            <ProfileManagement
              reloadUser={this.reloadWindow}
              token={this.state.token}
              user={this.state.user}
            />
          )}
        </div>

        <div style={{ maxWidth: '800px', width: '100%' }}>
          {this.state.isEditable ? (
            <textarea
              className='profile-bio'
              placeholder='Type something here for your bio...'
              value={this.state.biography}
              onChange={this.handleBiographyChange}
            />
          ) : (
            <div className='profile-bio'>{this.state.biography}</div>
          )}

          <div className='profile-posts-wrapper'>{this.renderPosts()}</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  ...state
})

export default connect(mapStateToProps)(withRouter(Profile))
