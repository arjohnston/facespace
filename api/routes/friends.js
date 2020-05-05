const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const passport = require('passport')
require('../config/passport')(passport)
const mongoose = require('mongoose')
const User = require('../models/User')
const config = require('../../util/settings')
const {
  OK,
  NOT_FOUND,
  UNAUTHORIZED,
  BAD_REQUEST
  // CONFLICT
} = require('../../util/statusCodes')

// /api/friends/getFriends: gets a list of all of your friends
router.post('/getFriends', function (req, res) {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const id = mongoose.Types.ObjectId(decoded.id)

      User.findOne(
        {
          _id: id
        },
        function (error, user) {
          if (error) {
            // Bad Request
            return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
          }

          if (!user) {
            // Unauthorized if the email does not match any records in the database
            res.status(UNAUTHORIZED).send({
              message: 'Email or password does not match our records.'
            })
          } else {
            // Check if password matches database
            const friendsDecoded = []

            const promises = []

            for (const friend in user.friends) {
              promises.push(
                new Promise((resolve, reject) => {
                  User.findOne({ _id: user.friends[friend] }, (error, user) => {
                    if (error) return console.log(error)

                    const frnd = {
                      _id: user._id,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                      username: user.username
                    }

                    friendsDecoded.push(frnd)

                    resolve()
                  })
                })
              )
            }

            Promise.all(promises).then(() => {
              res.status(OK).send(friendsDecoded)
            })
          }
        }
      )
    }
  })
})

// /api/friends/addFriend: append a friend to the array of your friends
router.post('/addFriend', function (req, res) {
  if (!req.body.token || !req.body.friendId) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const id = mongoose.Types.ObjectId(decoded.id)

      User.updateOne(
        {
          _id: id
        },
        { $push: { friends: req.body.friendId } },
        function (error, result) {
          if (error) {
            return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
          }

          if (result.nModified < 1) {
            return res
              .status(NOT_FOUND)
              .send({ message: `${decoded.id} not found.` })
          }

          return res.status(OK).send({ message: `${decoded.id} was updated.` })
        }
      )
    }
  })
})

// /api/friends/removeFriend: remove a friend from your friends list
router.post('/removeFriend', function (req, res) {
  if (!req.body.token || !req.body.friendId) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const id = mongoose.Types.ObjectId(decoded.id)

      User.updateOne(
        {
          _id: id
        },
        { $pull: { friends: req.body.friendId } },
        function (error, result) {
          if (error) {
            return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
          }

          if (result.nModified < 1) {
            return res
              .status(NOT_FOUND)
              .send({ message: `${decoded.id} not found.` })
          }

          return res.status(OK).send({ message: `${decoded.id} was updated.` })
        }
      )
    }
  })
})

// /api/friends/getFriendRequests: gets a list of friend requests
router.post('/getFriendRequests', function (req, res) {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const id = mongoose.Types.ObjectId(decoded.id)

      User.findOne(
        {
          _id: id
        },
        function (error, user) {
          if (error) {
            // Bad Request
            return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
          }

          if (!user) {
            // Unauthorized if the email does not match any records in the database
            res.status(UNAUTHORIZED).send({
              message: 'Email or password does not match our records.'
            })
          } else {
            const friendRequestsDecoded = []
            const promises = []

            for (const friend in user.friendRequests) {
              promises.push(
                new Promise((resolve, reject) => {
                  User.findOne(
                    { _id: user.friendRequests[friend] },
                    (error, user) => {
                      if (error) return console.log(error)

                      const frnd = {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        username: user.username
                      }

                      friendRequestsDecoded.push(frnd)

                      resolve()
                    }
                  )
                })
              )
            }

            Promise.all(promises).then(() => {
              res.status(OK).send(friendRequestsDecoded)
            })
          }
        }
      )
    }
  })
})

// /api/friends/addFriendRequest: adds a request of myself to a targeted user (request a friendship)
router.post('/addFriendRequest', function (req, res) {
  if (!req.body.token || !req.body.friendId) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const id = mongoose.Types.ObjectId(decoded.id)
      const frndId = mongoose.Types.ObjectId(req.body.friendId)

      User.updateOne(
        {
          _id: frndId
        },
        { $push: { friendRequests: id } },
        function (error, result) {
          if (error) {
            return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
          }

          if (result.nModified < 1) {
            return res
              .status(NOT_FOUND)
              .send({ message: `${decoded.id} not found.` })
          }

          return res.status(OK).send({ message: `${decoded.id} was updated.` })
        }
      )
    }
  })
})

// /api/friends/removeFriendRequest: removes a friend request (e.g. block/decline)
router.post('/removeFriendRequest', function (req, res) {
  if (!req.body.token || !req.body.friendId) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const id = mongoose.Types.ObjectId(decoded.id)
      const friendId = mongoose.Types.ObjectId(req.body.friendId)

      User.updateOne(
        {
          _id: id
        },
        { $pull: { friendRequests: friendId } },
        function (error, result) {
          if (error) {
            return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
          }

          if (result.nModified < 1) {
            return res
              .status(NOT_FOUND)
              .send({ message: `${decoded.id} not found.` })
          }

          return res.status(OK).send({ message: `${decoded.id} was updated.` })
        }
      )
    }
  })
})

// /api/friends/getNonFriends: gets all users that are not friends, to help with searching for new friends
router.post('/getNonFriends', function (req, res) {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      // Build this out to search for a user
      const id = mongoose.Types.ObjectId(decoded.id)

      User.aggregate()
        .match({ _id: { $not: { $eq: id } } })
        .project({
          password: 0,
          __v: 0,
          lastLogin: 0,
          username: 0
        })
        .exec((err, users) => {
          if (err) {
            return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
          } else {
            // get friends
            // for

            User.findOne(
              {
                _id: id
              },
              function (error, user) {
                if (error) {
                  // Bad Request
                  return res
                    .status(BAD_REQUEST)
                    .send({ message: 'Bad Request.' })
                }

                if (!user) {
                  // Unauthorized if the email does not match any records in the database
                  res.status(UNAUTHORIZED).send({
                    message: 'Email or password does not match our records.'
                  })
                } else {
                  // Check if password matches database
                  for (const friend in user.friends) {
                    for (const nonFriend in users) {
                      if (user.friends[friend].id === users[nonFriend].id) {
                        users.splice(nonFriend, 1)
                      }
                    }
                  }
                  const friends = []
                  for (const user in users) {
                    friends.push({
                      _id: users[user]._id,
                      firstName: users[user].firstName,
                      lastName: users[user].lastName,
                      email: users[user].email,
                      username: users[user].username
                    })
                  }
                  res.status(OK).send(users)
                }
              }
            )
          }
        })
    }
  })
})

module.exports = router
