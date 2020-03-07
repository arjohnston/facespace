import React, { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default class extends Component {
  constructor () {
    super()
    this.state = {
      email: '',
      password: '',
      remember: false,
      message: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount () {
    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    // If token is present, log them in
    if (token) {
      if (this.props.history) this.props.history.push('/')
    }
  }

  handleChange (e) {
    const state = Object.assign({}, { ...this.state }, null)
    if (e.target.name === 'remember') {
      state[e.target.name] = !state[e.target.name]
    } else {
      state[e.target.name] = e.target.value
    }

    this.setState(state)

    console.log(e.target.value)
  }

  handleSubmit (e) {
    e.preventDefault()

    const { email, password, remember } = this.state

    axios
      .post('/api/auth/login', { email, password, remember })
      .then(result => {
        window.localStorage.setItem('jwtToken', result.data.token)

        this.setState({
          message: '',
          email: email,
          token: result.data.token
        })
      })
      .then(() => {
        this.updateLastLoginDate(this.state.email, this.state.token)
      })
      .catch(error => {
        this.setState({
          message: error.response.data.message
        })
      })
  }

  updateLastLoginDate (email, token) {
    axios
      .post('/api/auth/edit', {
        queryEmail: email,
        lastLogin: new Date(),
        // This token must be passed in for authentication
        token: token
      })
      .then(() => {
        if (this.props.history) {
          this.props.history.push('/')
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  render () {
    const { email, password, remember, message } = this.state

    return (
      <div className='login-container'>
        <div className='login-header'>
          <img src='/logo.svg' alt='logo' style={{ height: '60px' }} />
        </div>
        <h1>Welcome</h1>

        <form onSubmit={this.handleSubmit}>
          {message !== '' && <span>{message}</span>}

          <label htmlFor='email'>Email</label>
          <div className='form-input-wrapper'>
            <input
              type='email'
              name='email'
              id='email'
              value={email}
              onChange={this.handleChange}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>
          </div>

          <label htmlFor='password'>Password</label>
          <div className='form-input-wrapper'>
            <input
              type='password'
              name='password'
              id='password'
              value={password}
              onChange={this.handleChange}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z' />
            </svg>
          </div>

          <div className='alternate-cta'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type='checkbox' name='remember' id='remember' value={remember} onChange={this.handleChange} checked={remember} />
              <label htmlFor='remember' style={{ letterSpacing: '0', fontWeight: '400' }}>Remember me</label>
            </div>

            <Link to='/forgot-password'>
              Forgot Password?
            </Link>
          </div>

          <button
            disabled={
              !this.state.password.length > 0 && !this.state.email.length > 0
            }
            className={
              this.state.password.length > 0 && this.state.email.length > 0
                ? 'active'
                : 'inactive'
            }
            type='submit'
          >
            <svg style={{ width: '24px', height: '24px' }} viewBox='0 0 24 24'>
              <path d='M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z' />
            </svg>
            Login
          </button>
        </form>

        <p>
          Not registered? <Link to='/register'>Sign up</Link>
        </p>
      </div>
    )
  }
}
