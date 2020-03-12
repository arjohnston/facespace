import React, { Component } from 'react'
import CreatePost from '../components/Posts/CreatePost'

export default class extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='overview-container'>
        <CreatePost />
      </div>
    )
  }
}
