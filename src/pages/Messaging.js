import React, { Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'

import List from '../components/Messaging/List'
import MessageBox from '../components/Messaging/MessageBox'

// Search msgs + names
// Messenger UI

export class Messaging extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userSelected: null,
      users: null,
      onlineUsers: [],
      createNewConversation: false
    }

    this.selectUser = this.selectUser.bind(this)
    this.refreshConversationList = this.refreshConversationList.bind(this)
    this.createNewConversation = this.createNewConversation.bind(this)
  }

  selectUser (user) {
    this.setState({
      userSelected: user,
      createNewConversation: false
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

  componentDidUpdate (prevProps, prevState) {
    if (prevState.onlineUsers !== this.state.onlineUsers) {
      this.setState({
        onlineUsers: this.state.onlineUsers
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.onlineUsers !== prevState.onlineUsers) {
      return { onlineUsers: nextProps.onlineUsers }
    } else return null
  }

  createNewConversation () {
    this.setState({
      createNewConversation: true,
      userSelected: null
    })
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

        if (window && window.innerWidth < 767) {
          this.setState({
            users: users
          })
        } else {
          this.setState({
            users: users,
            userSelected: users[0]
          })
        }
      })
      .catch(err => console.log(err))
  }

  render () {
    return (
      <div className='messaging-container'>
        <div
          className={`messaging-slider-track ${
            this.state.userSelected || this.state.createNewConversation
              ? 'user-selected'
              : ''
          }`}
        >
          <List
            users={this.state.users}
            userSelected={this.state.userSelected}
            selectUser={this.selectUser}
            onlineUsers={this.state.onlineUsers}
            createNewConversation={this.createNewConversation}
            token={this.state.token}
          />
          <MessageBox
            userSelected={this.state.userSelected}
            selectUser={this.selectUser}
            refreshConversationList={this.refreshConversationList}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  ...state
})

export default connect(mapStateToProps)(Messaging)
