// https://codepen.io/jcalderaio/pen/qBdWKXM?editors=0010

export default function usersTyping (state = [], action) {
  switch (action.type) {
    case 'SET_USER_TYPING':
      if (state.includes(action.payload)) return state
      return [...state, action.payload]

    case 'REMOVE_USER_TYPING':
      return state.filter(element => element !== action.payload)

    default:
      return state
  }
}
