import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import './style.css'

export default class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='header'>
        <div>
          <Link to='/'>
            <img src='/logo.svg' alt='MyFace logo' className='logo' />
          </Link>
        </div>
        <nav>
          <Link to='/messaging'>Messaging</Link>
          <Link to='/friends'>Friends</Link>
          <Link to='/profile'>Profile</Link>
        </nav>
      </div>
    )
  }
}
