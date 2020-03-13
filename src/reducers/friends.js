// https://codepen.io/jcalderaio/pen/qBdWKXM?editors=0010

export default function user (state = [], action) {
  switch (action.type) {
    case 'SET_LIST_OF_FRIENDS':
      return action.payload

    default:
      return state
  }
}
