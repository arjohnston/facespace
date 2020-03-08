import React, { Component } from 'react'

import List from '../components/Messaging/List'
import MessageBox from '../components/Messaging/MessageBox'

const friends = [
  {
    name: 'Cookie Monster',
    profileImg: null,
    online: true,
    messages: [
      {
        type: 'from',
        message: 'I WANT COOKIE',
        timestamp: '2:39AM'
      },
      {
        type: 'to',
        message: 'I mean... I can bake cookies',
        timestamp: '2:41AM'
      },
      {
        type: 'from',
        message: 'COOKIE!!',
        timestamp: '2:42AM'
      }
    ]
  },
  {
    name: 'Garbage Collector',
    profileImg: null,
    online: false
  },
  {
    name: 'Ernie',
    profileImg: null,
    online: false
  }
]

export default class Messaging extends Component {
  constructor (props) {
    super(props)
    this.state = {
      friendSelected: 0
    }

    this.selectFriend = this.selectFriend.bind(this)
  }

  selectFriend (index) {
    this.setState({
      friendSelected: index
    })
  }

  componentDidMount () {
    document.title = 'Messaging'
  }

  componentDidMount () {
    document.title = 'Messaging'
  }

  render () {
    return (
      <div className='messaging-container'>
        <List friends={friends} selectFriend={this.selectFriend} />
        <MessageBox messages={friends[this.state.friendSelected]} />
      </div>
    )
  }
}
