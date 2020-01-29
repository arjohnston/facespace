import React from 'react'
import { Link } from 'react-router-dom'

export default class Error extends React.Component {
  render () {
    return (
      <div className='container'>
        <h1>
          Whoops, looks like the page doesn't exist. <Link to='/'>Return home</Link>
        </h1>
      </div>
    )
  }
}
