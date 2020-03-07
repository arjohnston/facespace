// https://codepen.io/jcalderaio/pen/qBdWKXM?editors=0010

export default function examples (state = [], action) {
  switch (action.type) {
    case 'ADD_EXAMPLE':
      return state.concat([action.text])
    default:
      return state
  }
}
