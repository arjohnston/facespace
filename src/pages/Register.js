import React, { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default class extends Component {
  constructor () {
    super()
    this.state = {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      message: '',
      passwordStrengthScore: 0,
      passwordMeterColor: 'red',
      passwordMeterProgress: '25%',
      usernameAvailable: null,
      emailAvailable: null,
      passwordMeetsRequirements: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCheckIfUsernameExists = this.handleCheckIfUsernameExists.bind(this)
    this.handleCheckIfEmailExists = this.handleCheckIfEmailExists.bind(this)
  }

  handleCheckIfUsernameExists () {
    if (!this.state.username) return

    axios
      .post('/api/auth/checkIfUsernameExists', { username: this.state.username })
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

  handleCheckIfEmailExists () {
    if (!this.state.email) return

    if (!/^.+@.+\..+$/.test(this.state.email)) {
      this.setState({
        message: 'Invalid email address'
      })

      return
    }

    axios
      .post('/api/auth/checkIfEmailExists', { email: this.state.email })
      .then(result => {
        if (result.status >= 200 && result.status < 300) {
          this.setState({
            emailAvailable: true,
            message: ''
          })
        }
      })
      .catch(() => {
        this.setState({
          emailAvailable: false,
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

    // let passwordStrength = 'Too short'
    let passwordMeterColor = 'red'
    let passwordMeterProgress = '25%'

    if (score > 80) {
      passwordMeterColor = 'green'
      passwordMeterProgress = '100%'
    } else if (score > 60) {
      passwordMeterColor = 'orange'
      passwordMeterProgress = '75%'
    } else if (score >= 30) {
      passwordMeterColor = 'red'
      passwordMeterProgress = '50%'
    }

    // let passwordMeetsRequirements = this.state.passwordMeetsRequirements

    axios
      .post('/api/auth/checkIfPasswordMeetsRequirements', { password })
      .then((result) => {
        console.log(result)
        this.setState({
          passwordStrengthScore: score,
          passwordMeterColor: passwordMeterColor,
          passwordMeterProgress: passwordMeterProgress,
          passwordMeetsRequirements: result.status >= 200 && result.status < 300
        })
      })
      .catch(() => {
        this.setState({
          passwordStrengthScore: score,
          passwordMeterColor: passwordMeterColor,
          passwordMeterProgress: passwordMeterProgress,
          passwordMeetsRequirements: false
        })
      })
  }

  handleSubmit (e) {
    e.preventDefault()

    const { email, username, password, confirmPassword } = this.state

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
      .post('/api/auth/register', { email, username, password })
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
    const { email, username, password, confirmPassword, message } = this.state

    return (
      <div className='login-container'>
        <div className='login-header'>
          <img src='/logo.svg' alt='logo' style={{ height: '60px' }} />
        </div>
        <h1>Create your account</h1>
        <form onSubmit={this.handleSubmit}>
          {message !== '' && <span>{message}</span>}

          <label htmlFor='username'>Username</label>
          <div className='form-input-wrapper'>
            <input
              type='text'
              name='username'
              id='username'
              value={username}
              onChange={this.handleChange}
              onBlur={this.handleCheckIfUsernameExists}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>

            {this.state.usernameAvailable && (
              <svg viewBox='0 0 24 24' className='checkmark'>
                <path d='M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' />
              </svg>
            )}
          </div>
          {!this.state.usernameAvailable && this.state.usernameAvailable !== null && (
            <div style={{ margin: '-12px 0 12px 12px' }}>
              <span>✘ Username {username} is not available</span>
            </div>
          )}

          <label htmlFor='email'>Email</label>
          <div className='form-input-wrapper'>
            <input
              type='email'
              name='email'
              id='email'
              value={email}
              onChange={this.handleChange}
              onBlur={this.handleCheckIfEmailExists}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z' />
            </svg>

            {this.state.emailAvailable && (
              <svg viewBox='0 0 24 24' className='checkmark'>
                <path d='M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' />
              </svg>
            )}
          </div>
          {!this.state.emailAvailable && this.state.emailAvailable !== null && (
            <div style={{ margin: '-12px 0 12px 12px' }}>
              <span>✘ {email} is already in use</span>
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

            {this.state.passwordMeetsRequirements && (
              <svg viewBox='0 0 24 24' className='checkmark'>
                <path d='M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' />
              </svg>
            )}
          </div>

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

            {password === confirmPassword && password !== '' && (
              <svg viewBox='0 0 24 24' className='checkmark'>
                <path d='M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' />
              </svg>
            )}
          </div>

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
