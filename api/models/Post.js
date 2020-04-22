const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create a new schema for the User
const PostSchema = new Schema({
  text: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Array,
    default: []
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true
  }
})

module.exports =
  mongoose.models && mongoose.models.Post
    ? mongoose.models.Post
    : mongoose.model('Post', PostSchema)
