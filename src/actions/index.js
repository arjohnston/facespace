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
