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
      message: '',
      passwordShown: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCheckForCapsLock = this.handleCheckForCapsLock.bind(this)
    this.handleTogglePasswordShown = this.handleTogglePasswordShown.bind(this)
  }

  componentDidMount () {
    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    document.title = 'myface: Login'

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
        if (this.props.history) this.props.history.push('/')
      })
      .catch(error => {
        this.setState({
          message: error.response.data.message
        })
      })
  }

  handleCheckForCapsLock (e) {
    // console.log(e.getModifierState('CapsLock'))
    const message = e.getModifierState('CapsLock') ? 'Caps lock is enabled' : ''
    this.setState({
      message: message
    })
  }

  handleTogglePasswordShown () {
    this.setState({
      passwordShown: !this.state.passwordShown
    })
  }

  render () {
    const { email, password, remember, message } = this.state

    return (
      <div className='login-container'>
        <div className='login-header'>
          <img src='/logo.svg' alt='logo' style={{ height: '50px' }} />
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
              onKeyDown={this.handleCheckForCapsLock}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>
          </div>

          <label htmlFor='password'>Password</label>
          <div className='form-input-wrapper'>
            <input
              type={this.state.passwordShown ? 'text' : 'password'}
              name='password'
              id='password'
              value={password}
              onChange={this.handleChange}
              onKeyDown={this.handleCheckForCapsLock}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z' />
            </svg>

            <label htmlFor='password'>
              {this.state.passwordShown && (
                <svg
                  viewBox='0 0 24 24'
                  className='show-password'
                  onClick={this.handleTogglePasswordShown}
                >
                  <path d='M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z' />
                </svg>
              )}

              {!this.state.passwordShown && (
                <svg
                  viewBox='0 0 24 24'
                  className='hide-password'
                  onClick={this.handleTogglePasswordShown}
                >
                  <path d='M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z' />
                </svg>
              )}
            </label>
          </div>

          <div className='alternate-cta'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type='checkbox'
                name='remember'
                id='remember'
                value={remember}
                onChange={this.handleChange}
                checked={remember}
              />
              <label
                htmlFor='remember'
                style={{ letterSpacing: '0', fontWeight: '400' }}
              >
                Remember me
              </label>
            </div>

            <Link to='/forgot-password'>Forgot Password?</Link>
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
