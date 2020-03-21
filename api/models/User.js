const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

// Create a new schema for the User
const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    username: {
      type: String,
      unique: true // Don't allow multiple users with the same username
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    isOnboarded: {
      type: Boolean,
      default: false
    },
    profileImg: {
      type: String
    },
    password: {
      type: String,
      required: true
    },
    lastLogin: {
      type: Date
    }
  },
  { collection: 'User' }
)

// When saving the user, ensure the password
// is hashed
UserSchema.pre('save', function (next) {
  const user = this
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (error, salt) {
      if (error) {
        return next(error)
      }

      bcrypt.hash(user.password, salt, null, function (error, hash) {
        if (error) {
          return next(error)
        }

        user.password = hash
        next()
      })
    })
  } else {
    return next()
  }
})

// Utility function to ensure the password correctly
// matches that of the one in the database
UserSchema.methods.comparePassword = function (passwd, callback) {
  bcrypt.compare(passwd, this.password, function (error, isMatch) {
    if (error) {
      return callback(error)
    }

    callback(null, isMatch)
  })
}

module.exports =
  mongoose.models && mongoose.models.User
    ? mongoose.models.User
    : mongoose.model('User', UserSchema)
