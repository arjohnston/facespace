import React, { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default class extends Component {
  constructor () {
    super()
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      message: '',
      passwordStrengthScore: 0,
      passwordMeterColor: 'red',
      passwordMeterProgress: '25%',
      emailAvailable: null,
      passwordShown: false,
      confirmPasswordShown: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    // this.handleCheckIfUsernameExists = this.handleCheckIfUsernameExists.bind(this)
    this.handleCheckIfEmailExists = this.handleCheckIfEmailExists.bind(this)
  }

  componentDidMount () {
    document.title = 'myface: Sign Up'
  }

  // handleCheckIfUsernameExists () {
  //   if (!this.state.username) return
  //
  //   axios
  //     .post('/api/auth/checkIfUsernameExists', { username: this.state.username })
  //     .then(result => {
  //       if (result.status >= 200 && result.status < 300) {
  //         this.setState({
  //           usernameAvailable: true,
  //           message: ''
  //         })
  //       }
  //     })
  //     .catch(() => {
  //       this.setState({
  //         usernameAvailable: false,
  //         message: ''
  //       })
  //     })
  // }

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

    this.setState({
      passwordStrengthScore: score,
      passwordMeterColor: passwordMeterColor,
      passwordMeterProgress: passwordMeterProgress
    })
  }

  handleSubmit (e) {
    e.preventDefault()

    const { email, password, confirmPassword } = this.state

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
      .post('/api/auth/register', { email, password })
      .then(() => {
        this.setState({ message: '' })
        this.props.history.push('/login')
      })
      .catch(error => {
        console.log(error)
        this.setState({
          message: error.response.data.message
        })
      })
  }

  handleTogglePasswordShown (type) {
    if (type === 'password') {
      this.setState({
        passwordShown: !this.state.passwordShown
      })
    } else {
      this.setState({
        confirmPasswordShown: !this.state.confirmPasswordShown
      })
    }
  }

  render () {
    const { email, password, confirmPassword, message } = this.state

    return (
      <div className='login-container'>
        <div className='login-header'>
          <img src='/logo.svg' alt='logo' style={{ height: '50px' }} />
        </div>
        <h1>Create your account</h1>
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
              type={this.state.passwordShown ? 'text' : 'password'}
              name='password'
              id='password'
              value={password}
              onChange={this.handleChange}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z' />
            </svg>

            <label htmlFor='password'>
              {this.state.passwordShown && (
                <svg viewBox='0 0 24 24' className='show-password' onClick={this.handleTogglePasswordShown.bind(this, 'password')}>
                  <path d='M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z' />
                </svg>
              )}

              {!this.state.passwordShown && (
                <svg viewBox='0 0 24 24' className='hide-password' onClick={this.handleTogglePasswordShown.bind(this, 'password')}>
                  <path d='M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z' />
                </svg>
              )}
            </label>
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
              type={this.state.confirmPasswordShown ? 'text' : 'password'}
              name='confirmPassword'
              id='confirmPassword'
              value={confirmPassword}
              onChange={this.handleChange}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z' />
            </svg>

            <label htmlFor='confirmPassword'>
              {this.state.confirmPasswordShown && (
                <svg viewBox='0 0 24 24' className='show-password' onClick={this.handleTogglePasswordShown.bind(this, 'confirmPassword')}>
                  <path d='M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z' />
                </svg>
              )}

              {!this.state.confirmPasswordShown && (
                <svg viewBox='0 0 24 24' className='hide-password' onClick={this.handleTogglePasswordShown.bind(this, 'confirmPassword')}>
                  <path d='M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z' />
                </svg>
              )}
            </label>
          </div>

          <button
            disabled={
              !this.state.password.length > 0 &&
              !this.state.confirmPassword.length > 0
            }
            className={
              this.state.password.length > 0 &&
              this.state.confirmPassword.length > 0
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
