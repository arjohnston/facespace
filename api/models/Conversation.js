const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create a new schema for the Conversation
const ConversationSchema = new Schema(
  {
    recipients: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    lastMessage: {
      type: String
    },
    date: {
      type: String,
      default: Date.now
    }
  },
  { collection: 'Conversation' }
)

module.exports =
  mongoose.models && mongoose.models.Conversation
    ? mongoose.models.Conversation
    : mongoose.model('Conversation', ConversationSchema)
