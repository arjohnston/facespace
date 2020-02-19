import React, { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default class extends Component {
  constructor () {
    super()
    this.state = {
      username: '',
      password: '',
      confirmPassword: '',
      message: '',
      passwordStrength: 'Too short',
      passwordStrengthScore: 0,
      passwordMeterColor: 'red',
      passwordMeterProgress: '25%',
      usernameAvailable: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCheckIfUserExists = this.handleCheckIfUserExists.bind(this)
  }

  handleCheckIfUserExists () {
    if (!this.state.username) return

    if (!/^.+@.+\..+$/.test(this.state.username)) {
      this.setState({
        message: 'Invalid email address'
      })

      return
    }

    axios
      .post('/api/auth/checkIfUserExists', { username: this.state.username })
      .then(result => {
        if (result.status >= 200 && result.status < 300) {
          this.setState({
            usernameAvailable: true,
            message: ''
          })
        }
      })
      .catch(() => {
        this.setState({
          usernameAvailable: false,
          message: ''
        })
      })
  }

  handleChange (e) {
    const state = Object.assign({}, { ...this.state }, null)
    state[e.target.name] = e.target.value
    this.setState(state)

    if (e.target.name === 'password') {
      this.scorePassword(e.target.value)
    }
  }

  scorePassword (password) {
    let score = 0
    if (!password) return score

    // award every unique letter until 5 repetitions
    const letters = {}
    for (let i = 0; i < password.length; i++) {
      letters[password[i]] = (letters[password[i]] || 0) + 1
      score += 5.0 / letters[password[i]]
    }

    // bonus points for mixing it up
    var variations = {
      digits: /\d/.test(password),
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      nonWords: /\W/.test(password)
    }

    let variationCount = 0
    for (var check in variations) {
      variationCount += variations[check] === true ? 1 : 0
    }
    score += (variationCount - 1) * 10

    let passwordStrength = 'Too short'
    let passwordMeterColor = 'red'
    let passwordMeterProgress = '25%'

    if (score > 80) {
      passwordStrength = 'Strong'
      passwordMeterColor = 'green'
      passwordMeterProgress = '100%'
    } else if (score > 60) {
      passwordStrength = 'Good'
      passwordMeterColor = 'orange'
      passwordMeterProgress = '75%'
    } else if (score >= 30) {
      passwordStrength = 'Weak'
      passwordMeterColor = 'red'
      passwordMeterProgress = '50%'
    }

    this.setState({
      passwordStrengthScore: score,
      passwordStrength: passwordStrength,
      passwordMeterColor: passwordMeterColor,
      passwordMeterProgress: passwordMeterProgress
    })
  }

  handleSubmit (e) {
    e.preventDefault()

    const { username, password, confirmPassword } = this.state

    // If the password doesn't exist or the password and confirmPassword don't match,
    // then return
    if (!password || !confirmPassword) {
      this.setState({
        message: 'Password missing'
      })

      return
    }

    if (password !== confirmPassword) {
      this.setState({
        message: 'Passwords do not match'
      })

      return
    }

    axios
      .post('/api/auth/register', { username, password })
      .then(() => {
        this.setState({ message: '' })
        this.props.history.push('/login')
      })
      .catch(error => {
        this.setState({
          message: error.response.data.message
        })
      })
  }

  render () {
    const { username, password, confirmPassword, message } = this.state

    return (
      <div className='login-container'>
        <div className='login-header'>
          <img src='/logo.svg' alt='logo' style={{ height: '100px' }} />
        </div>
        <h1>Create your account</h1>
        <form onSubmit={this.handleSubmit}>
          {message !== '' && <span>{message}</span>}

          <label htmlFor='username'>Email</label>
          <div className='form-input-wrapper'>
            <input
              type='email'
              name='username'
              id='username'
              value={username}
              onChange={this.handleChange}
              onBlur={this.handleCheckIfUserExists}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>
          </div>
          {this.state.usernameAvailable !== null && (
            <div style={{ margin: '0 0 12px 12px' }}>
              {this.state.usernameAvailable ? (
                <span style={{ color: 'green' }}>✔ Username available</span>
              ) : (
                <span>✘ Username not available</span>
              )}
            </div>
          )}

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

          <label htmlFor='confirmPassword'>Confirm Password</label>
          <div className='form-input-wrapper'>
            <input
              type='password'
              name='confirmPassword'
              id='confirmPassword'
              value={confirmPassword}
              onChange={this.handleChange}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z' />
            </svg>
          </div>

          {this.state.password.length > 0 && (
            <div className='password-strength'>
              Password Strength:{' '}
              <span style={{ color: this.state.passwordMeterColor }}>
                {this.state.passwordStrength}
              </span>
            </div>
          )}

          {this.state.password.length > 0 && (
            <div className='password-meter-wrapper'>
              <div
                className='password-meter'
                style={{
                  background: this.state.passwordMeterColor,
                  width: this.state.passwordMeterProgress
                }}
              />
            </div>
          )}

          <button
            disabled={
              !this.state.password.length > 0 &&
              !this.state.confirmPassword.length > 0 &&
              !this.state.username.length > 0
            }
            className={
              this.state.password.length > 0 &&
              this.state.confirmPassword.length > 0 &&
              this.state.username.length > 0
                ? 'active'
                : 'inactive'
            }
            type='submit'
          >
            Create Account
          </button>
        </form>
        <p>
          Already have an account? <Link to='/login'>Login</Link>
        </p>
      </div>
    )
  }
}
