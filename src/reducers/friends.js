export default function friends (state = [], action) {
  switch (action.type) {
    case 'SET_LIST_OF_FRIENDS':
      return action.payload

    default:
      return state
  }
}
