import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import reducer from './reducers/index'
import io from 'socket.io-client'

// For testing on localhost, uncomment this
// const URL = 'localhost:8080'
const URL = '/'

const createMySocketMiddleware = store => {
  if (process.env.NODE_ENV !== 'test') {
    const socket = io(URL, {
      transports: ['websocket'],
      secure: true,
      port: 8080
    })

    socket.on('message', message => {
      console.log('recieved...')
      store.dispatch({
        type: 'RECEIVE_MESSAGE',
        payload: message
      })
    })

    socket.on('online-users', users => {
      store.dispatch({
        type: 'SET_ONLINE_USERS',
        payload: users
      })
    })

    socket.on('user-started-typing', user => {
      store.dispatch({
        type: 'SET_USER_TYPING',
        payload: user
      })
    })

    socket.on('user-stopped-typing', user => {
      store.dispatch({
        type: 'REMOVE_USER_TYPING',
        payload: user
      })
    })

    return next => action => {
      if (action.type === 'SEND_SOCKET_MESSAGE') {
        console.log('emitting socket..')
        socket.emit('message', action.payload)
        return
      }

      if (action.type === 'SET_USER_LOGGED_IN') {
        socket.emit('user-connected', action.payload.userId)
      }

      if (action.type === 'START_TYPING') {
        return socket.emit('start-typing', action.payload)
      }

      if (action.type === 'STOP_TYPING') {
        return socket.emit('stop-typing', action.payload)
      }

      return next(action)
    }
  }

  return next => action => next(action)
}

export default configureStore({
  reducer: reducer,
  middleware: [...getDefaultMiddleware(), createMySocketMiddleware]
})
