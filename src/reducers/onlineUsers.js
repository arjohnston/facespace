export default function onlineUsers (state = [], action) {
  switch (action.type) {
    case 'SET_ONLINE_USER':
      return [...state, action.payload]

    case 'REMOVE_ONLINE_USER':
      return state.filter(id => id !== action.payload)

    default:
      return state
  }
}
