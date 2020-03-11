import React, { Component } from 'react'

export default class Friends extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    document.title = 'Messaging'
  }

  render () {
    return <div>yo, friend.</div>
  }
}
