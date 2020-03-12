import React, { Component } from 'react'
import axios from 'axios'

import List from '../components/Messaging/List'
import MessageBox from '../components/Messaging/MessageBox'

// const friends = [
//   {
//     name: 'Cookie Monster',
//     profileImg: null,
//     online: true,
//     messages: [
//       {
//         type: 'from',
//         message: 'I WANT COOKIE',
//         timestamp: '2:39AM'
//       },
//       {
//         type: 'to',
//         message: 'I mean... I can bake cookies',
//         timestamp: '2:41AM'
//       },
//       {
//         type: 'from',
//         message: 'COOKIE!!',
//         timestamp: '2:42AM'
//       }
//     ]
//   },
//   {
//     name: 'Garbage Collector',
//     profileImg: null,
//     online: false
//   },
//   {
//     name: 'Ernie',
//     profileImg: null,
//     online: false
//   }
// ]

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
      .post('/api/auth/getAllUsers', { token: this.state.token })
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
