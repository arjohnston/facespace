const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create a new schema for the Message
const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'conversations'
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    message: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'Message' }
)

module.exports =
  mongoose.models && mongoose.models.Message
    ? mongoose.models.Message
    : mongoose.model('Message', MessageSchema)
