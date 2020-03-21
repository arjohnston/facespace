import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import reducer from './reducers/index'
import io from 'socket.io-client'

const createMySocketMiddleware = (store) => {
  const socket = io('ws://localhost:8080', { transports: ['websocket', 'polling'] })

  socket.on('message', (message) => {
    store.dispatch({
      type: 'RECEIVE_MESSAGE',
      payload: message
    })
  })

  socket.on('online-users', (users) => {
    store.dispatch({
      type: 'SET_ONLINE_USERS',
      payload: users
    })
  })

  return next => action => {
    if (action.type === 'SEND_SOCKET_MESSAGE') {
      socket.emit('message', action.payload)
      return
    }

    if (action.type === 'SET_USER_LOGGED_IN') {
      socket.emit('user-connected', action.payload.id)
    }

    return next(action)
  }
}

export default configureStore({
  reducer: reducer,
  middleware: [...getDefaultMiddleware(), createMySocketMiddleware]
})
