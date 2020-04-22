export default function receivedMessage (state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_MESSAGE':
      return action.payload

    default:
      return state
  }
}
