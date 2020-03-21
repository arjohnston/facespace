import { combineReducers } from 'redux'
import user from './user'
import friends from './friends'
import onlineUsers from './onlineUsers'
import receivedMessage from './receivedMessage'

export default combineReducers({
  user,
  friends,
  onlineUsers,
  receivedMessage
})
