const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create a new schema for the Image
const MessageImageSchema = new Schema(
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
    data: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'MessageImage' }
)

module.exports =
  mongoose.models && mongoose.models.MessageImage
    ? mongoose.models.MessageImage
    : mongoose.model('MessageImage', MessageImageSchema)
