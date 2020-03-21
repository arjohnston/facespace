// https://codepen.io/jcalderaio/pen/qBdWKXM?editors=0010

export default function user (state = {}, action) {
  switch (action.type) {
    case 'SET_USER_LOGGED_IN':
      return {
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        profileImg: action.payload.profileImg,
        username: action.payload.username,
        email: action.payload.email,
        userId: action.payload.userId
      }

    default:
      return state
  }
}
