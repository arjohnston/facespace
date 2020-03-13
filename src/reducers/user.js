// https://codepen.io/jcalderaio/pen/qBdWKXM?editors=0010

export default function user (state = {}, action) {
  switch (action.type) {
    case 'SET_USER_LOGGED_IN':
      return {
        name: action.payload.name,
        username: action.payload.username,
        email: action.payload.email
      }

    default:
      return state
  }
}
