import React, { Component } from 'react'
import Search from '../components/Friends/Search'

export default class Friends extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div>
        <Search />
        Hello there, friend.
      </div>
    )
  }
}
