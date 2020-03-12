import React, { Component } from 'react'
import axios from 'axios'

import List from '../components/Messaging/List'
import MessageBox from '../components/Messaging/MessageBox'

export default class Messaging extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userSelected: null,
      users: []
    }

    this.selectUser = this.selectUser.bind(this)
  }

  selectUser (user) {
    this.setState({
      userSelected: user
    })
  }

  componentDidMount () {
    document.title = 'Messaging'

    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    this.setState(
      {
        token: token
      },
      () => this.getListOfUsers()
    )
  }

  // This should be upgraded once the Friends section is implemented
  getListOfUsers () {
    axios
      .post('/api/messages/getConversationList', { token: this.state.token })
      .then(res => {
        this.setState({
          users: res.data
        })
      })
      .catch(err => console.log(err))
  }

  render () {
    return (
      <div className='messaging-container'>
        <List users={this.state.users} selectUser={this.selectUser} />
        <MessageBox userSelected={this.state.userSelected} />
      </div>
    )
  }
}
