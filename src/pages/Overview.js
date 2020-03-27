import React, { Component } from 'react'
import CreatePost from '../components/Posts/CreatePost'
import Post from '../components/Posts/Post'
import axios from 'axios'

// const posts = [
//   {
//     profileImg: null,
//     name: "Cookie Monster",
//     text: "Like O.M.G. it was so totally worth it. So DELICIOUS! 🐣🍗",
//     likes: 640,
//     comments: []
//   },
//   {
//     profileImg: null,
//     name: "Monster",
//     text: "Hi world",
//     likes: 10,
//     comments: []
//   },
//   {
//     profileImg: null,
//     name: "Cookie ",
//     text: "🐣🍗",
//     likes: 440,
//     comments: []
//   }
// ]

export default class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      posts: [],
      token: null
    }
    this.renderPosts = this.renderPosts.bind(this)
    this.createPost = this.createPost.bind(this)
  }

  componentDidMount () {
    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    this.setState(
      {
        // posts: posts,
        token: token
      },
      () => this.getPosts()
    )
  }

  getPosts () {
    console.log('getpostcall')
    axios
      .post('/api/posts/getPosts', { token: this.state.token })
      .then(res => {
        console.log('resdata ', res.data)
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

  savePost (post) {
    axios
      .post('/api/posts/createPost', {
        token: this.state.token,
        text: post.text
      })
      // .then(res => {
      //
      // })
      .catch(error => {
        // if err statusCode == 401, then remove token & push /login
        // otherwise log the token
        console.log(error)
      })
  }

  createPost (post) {
    this.setState({
      posts: [post, ...this.state.posts] // creates array, makes this post as first element
    })
    this.savePost(post)
  }

  renderPosts () {
    if (this.state.posts.length <= 0) return
    console.log(this.state.posts)
    return this.state.posts.map((post, index) => {
      return (
        <div className='post-container' key={index}>
          <Post post={post} />
        </div>
      )
    })
  }

  render () {
    return (
      <div className='overview-container'>
        <CreatePost createPost={this.createPost} />
        {this.renderPosts()}
      </div>
    )
  }
}
