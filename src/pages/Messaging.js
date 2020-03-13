import React, { Component } from 'react'
// import axios from 'axios'
// import { connect } from 'react-redux'

import List from '../components/Messaging/List'
import MessageBox from '../components/Messaging/MessageBox'

export default class Messaging extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userSelected: null
    }

    this.selectUser = this.selectUser.bind(this)
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

    this.setState({
      token: token
    })
  }

  // This should be upgraded once the Friends section is implemented
  // getListOfUsers () {
  //   axios
  //     .post('/api/auth/getAllUsers', { token: this.state.token })
  //     .then(res => {
  //       this.setState({
  //         users: res.data
  //       })
  //     })
  //     .catch(err => console.log(err))
  // }

  render () {
    return (
      <div className='messaging-container'>
        <List selectUser={this.selectUser} />
        <MessageBox userSelected={this.state.userSelected} />
      </div>
    )
  }
}

// const mapStateToProps = state => ({
//   ...state
// })

// export default connect(mapStateToProps)(Messaging)
