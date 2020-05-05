const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const mongoose = require('mongoose')
const Post = require('../models/Post')
const User = require('../models/User')
const config = require('../../util/settings')
const {
  OK,
  NOT_FOUND,
  UNAUTHORIZED,
  BAD_REQUEST
} = require('../../util/statusCodes')

router.post('/getUser', function (req, res) {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      // Build this out to search for a user
      User.findOne(
        {
          _id: req.body.userId
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
            res.status(OK).send({
              lastLogin: user.lastLogin,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImg: user.profileImg,
              id: user._id,
              isOnboarded: user.isOnboarded
            })
          }
        }
      )
    }
  })
})

router.post('/getPosts', function (req, res) {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      // Build this out to search for a user
      const id = mongoose.Types.ObjectId(
        req.body.queryId ? req.body.queryId : decoded.id
      )

      Post.find(
        {
          user: id
        },
        function (error, posts) {
          if (error) {
            // Bad Request
            return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
          }

          if (!posts) {
            // Unauthorized if the email does not match any records in the database
            res.status(NOT_FOUND).send({
              message: 'Could not find any posts'
            })
          } else {
            // Check if password matches database
            res.status(OK).send(posts.reverse())
          }
        }
      )
    }
  })
})

router.post('/getFeed', function (req, res) {
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

      const postsArray = []
      const promises = []

      promises.push(
        new Promise((resolve, reject) => {
          Post.find(
            {
              user: id
            },
            function (error, posts) {
              if (error) {
                // Bad Request
                return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
              }

              if (posts) {
                // Check if password matches database
                postsArray.push(...posts)

                resolve()
              }
            }
          )
        })
      )

      promises.push(
        new Promise((resolve, reject) => {
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
                const prom = []

                for (const friend in user.friends) {
                  prom.push(
                    new Promise((resolve, reject) => {
                      Post.find(
                        { user: user.friends[friend] },
                        (error, post) => {
                          if (error) return console.log(error)

                          postsArray.push(...post)
                          resolve()
                        }
                      )
                    })
                  )
                }

                Promise.all(prom).then(() => {
                  resolve()
                })
              }
            }
          )
        })
      )

      Promise.all(promises).then(() => {
        postsArray.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        return res.status(OK).send(postsArray.reverse())
      })
    }
  })
})

router.post('/edit', (req, res) => {
  // Strip JWT from the token
  if (!req.body.token || !req.body.postId) return res.sendStatus(BAD_REQUEST)

  const token = req.body.token.replace(/^JWT\s/, '')
  const query = { _id: req.body.postId }
  const post = {
    ...req.body
  }

  // Remove the auth token from the form getting edited
  delete post.postId
  delete post.token

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      // Build this out to search for a user
      Post.updateOne(query, { ...post }, function (error, result) {
        if (error) {
          return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
        }

        if (result.nModified < 1) {
          return res.status(NOT_FOUND).send({ message: 'Post not found.' })
        }

        return res.status(OK).send({ message: 'Post was updated.' })
      })
    }
  })
})

router.post('/createPost', (req, res) => {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const post = new Post({
        text: req.body.text,
        imageData: req.body.imageData,
        imageName: req.body.imageName,
        user: mongoose.Types.ObjectId(decoded.id)
      })
      post.save(err => {
        if (err) {
          return res.status(BAD_REQUEST).send({ message: 'Failure.' })
        } else {
          return res.status(OK).send({ message: 'Success' })
        }
      })
    }
  })
})

module.exports = router
