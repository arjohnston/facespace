import React, { Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'

import List from '../components/Messaging/List'
import MessageBox from '../components/Messaging/MessageBox'

// DONE - The List should update the lastMessage when a new message is sent
// DONE - Creating a new conversation doesn't post the message to the UI???
// DONE - Creating a new convo doesnt add to List
// Online status
// typing bubbles
// Limit msg count to 50 when first loading. Query for more msgs
// Search msgs + names
// DONE - Attach img
// DONE - Click outside AttachmentInput, should close popup
// DONE - check size of upload to ensure its less than 1MB
// DONE - Check image type when dragging

// Messenger UI

// DONE - Onboarding:
// DONE - Username
// DONE - first name, last name
// DONE - profile pic

// Unit tests
// Mobile friendly
// Recaptcha on registering. Try out V3

// DONE - Dark mode (boolean). true by default if the browser reports prefers-color-scheme: dark.

export class Messaging extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userSelected: null,
      users: null
    }

    this.selectUser = this.selectUser.bind(this)
    this.refreshConversationList = this.refreshConversationList.bind(this)
  }

  selectUser (user) {
    this.setState({
      userSelected: user
    })
  }

  componentDidMount () {
    document.title = 'Messaging | myface'

    const token = window.localStorage
      ? window.localStorage.getItem('jwtToken')
      : ''

    this.setState(
      {
        token: token
      },
      () => this.getConversationList(token)
    )
  }

  refreshConversationList () {
    if (this.state.token) this.getConversationList(this.state.token)
  }

  getConversationList (token) {
    axios
      .post('/api/messages/getConversationList', { token: token })
      .then(res => {
        const users = []

        for (const obj in res.data) {
          for (const recipient in res.data[obj].recipientObj) {
            if (
              res.data[obj].recipientObj[recipient].email !==
              this.props.user.email
            ) {
              res.data[obj].recipientObj[recipient].lastMessage =
                res.data[obj].lastMessage
              res.data[obj].recipientObj[recipient].lastMessageDate =
                res.data[obj].date
              users.push(res.data[obj].recipientObj[recipient])
            }
          }
        }

        users
          .sort(
            (a, b) =>
              new Date(a.lastMessageDate).getTime() -
              new Date(b.lastMessageDate).getTime()
          )
          .reverse()

        this.setState({
          users: users
        })
      })
      .catch(err => console.log(err))
  }

  render () {
    return (
      <div className='messaging-container'>
        <List
          users={this.state.users}
          userSelected={this.state.userSelected}
          selectUser={this.selectUser}
        />
        <MessageBox
          userSelected={this.state.userSelected}
          selectUser={this.selectUser}
          refreshConversationList={this.refreshConversationList}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  ...state
})

export default connect(mapStateToProps)(Messaging)
