import React, { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default class extends Component {
  constructor () {
    super()
    this.state = {
      username: '',
      password: '',
      message: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount () {
    const token = window.localStorage ? window.localStorage.getItem('jwtToken') : ''

    // Logout if token is present
    if (token) {
      window.localStorage.removeItem('jwtToken')
      window.location.reload()
    }
  }

  handleChange (e) {
    const state = Object.assign({}, { ...this.state }, null)
    state[e.target.name] = e.target.value
    this.setState(state)
  }

  handleSubmit (e) {
    e.preventDefault()

    const { username, password } = this.state

    axios.post('/api/auth/login', { username, password })
      .then((result) => {
        window.localStorage.setItem('jwtToken', result.data.token)
        this.setState({ message: '' })
        this.props.history.push('/')
      })
      .catch((error) => {
        this.setState({
          message: error.response.data.message
        })
      })
  }

  render () {
    const { username, password, message } = this.state

    return (
      <div className='container'>
        <form onSubmit={this.handleSubmit}>
          <h1>Welcome</h1>

          {message !== '' &&
            <span>
              {message}
            </span>}

          <input
            type='email'
            name='username'
            placeholder='Email'
            value={username}
            onChange={this.handleChange}
            required
          />

          <input
            type='password'
            name='password'
            placeholder='Password'
            value={password}
            onChange={this.handleChange}
            required
          />

          <button
            disabled={!this.state.password.length > 0 && !this.state.username.length > 0}
            className={this.state.password.length > 0 && this.state.username.length > 0 ? 'active' : 'inactive'} type='submit'
          >
            <svg style={{ width: '24px', height: '24px' }} viewBox='0 0 24 24'>
              <path d='M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z' />
            </svg>Login
          </button>

          <p>
            Not registered? <Link to='/register'>Create an account</Link>
          </p>
        </form>
      </div>
    )
  }
}
