export function setLoggedInUser (payload) {
  return {
    type: 'SET_USER_LOGGED_IN',
    payload
  }
}

export function sendSocketMessage (payload) {
  return {
    type: 'SEND_SOCKET_MESSAGE',
    payload
  }
}

export function setListOfFriends (payload) {
  return {
    type: 'SET_LIST_OF_FRIENDS',
    payload
  }
}

export function setOnlineUsers (payload) {
  return {
    type: 'SET_ONLINE_USERS',
    payload
  }
}

// export function startTyping (payload) {
//   return {
//     type: 'SET_USER_TYPING',
//     payload
//   }
// }
//
// export function stopTyping (payload) {
//   return {
//     type: 'REMOVE_USER_TYPING',
//     payload
//   }
// }

export function startTyping (payload) {
  return {
    type: 'START_TYPING',
    payload
  }
}

export function stopTyping (payload) {
  return {
    type: 'STOP_TYPING',
    payload
  }
}
