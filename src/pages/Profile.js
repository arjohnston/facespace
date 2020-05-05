import React, { Component } from 'react'
import { withRouter } from 'react-router'
import axios from 'axios'

import ProfileHeader from '../components/Profile/ProfileHeader'
import ProfileManagement from '../components/Profile/ProfileManagement'
import Post from '../components/Posts/Post'

export class Profile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: null,
      posts: []
    }
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
      () => this.getPosts()
    )
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

  render () {
    return (
      <div>
        <ProfileHeader />

        <div className='profile-wrapper'>
          <ProfileManagement />
          <div className='profile-posts-wrapper'>{this.renderPosts()}</div>
        </div>
      </div>
    )
  }
}

export default withRouter(Profile)
