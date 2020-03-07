import React, { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

// Simple to start- just give them a new pwd
// if time allows, hook up w/ email: Mailchimp?

export default class extends Component {
  constructor () {
    super()
    this.state = {
      email: '',
      message: '',
      submitted: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (e) {
    const state = Object.assign({}, { ...this.state }, null)
    state[e.target.name] = e.target.value
    this.setState(state)
  }

  handleSubmit (e) {
    e.preventDefault()

    const { email } = this.state

    axios
      .post('/api/auth/forgot-password', { email })
      .then(() => {
        this.setState({
          message: 'An email has been sent to the users email address.',
          submitted: true
        })
      })
      .catch(error => {
        this.setState({
          message: error.response.data.message
        })
      })
  }

  render () {
    const { email, message } = this.state

    return !this.state.submitted ? (
      <div className='login-container'>
        <div className='login-header'>
          <img src='/logo.svg' alt='logo' style={{ height: '100px' }} />
        </div>
        <h1>Forgot Password</h1>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor='email'>Email</label>
          <div className='form-input-wrapper'>
            <input
              type='email'
              name='email'
              id='email'
              value={email}
              onChange={this.handleChange}
              onBlur={this.handleCheckIfUserExists}
              required
            />
            <svg viewBox='0 0 24 24'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>
          </div>

          <button
            disabled={!this.state.email.length > 0}
            className={this.state.email.length > 0 ? 'active' : 'inactive'}
            type='submit'
          >
            Send email with reset link
          </button>
        </form>

        <p>
          Already know your password? <Link to='/login'>Login</Link>
        </p>
      </div>
    ) : (
      <div className='login-container'>
        <div className='login-header'>
          <img src='/logo.svg' alt='logo' style={{ height: '100px' }} />
        </div>
        <h1>{message}</h1>
        <p style={{ fontSize: '1em' }}>
          <Link to='/login'>Return to login</Link>
        </p>
      </div>
    )
  }
}
