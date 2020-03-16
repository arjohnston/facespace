export function setLoggedInUser (payload) {
  return {
    type: 'SET_USER_LOGGED_IN',
    payload
  }
}

export function setListOfFriends (payload) {
  return {
    type: 'SET_LIST_OF_FRIENDS',
    payload
  }
}

export function setOnlineUser (payload) {
  return {
    type: 'SET_ONLINE_USER',
    payload
  }
}

export function removeOnlineUser (payload) {
  return {
    type: 'REMOVE_ONLINE_USER',
    payload
  }
}
