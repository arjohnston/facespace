const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const mongoose = require('mongoose')
const Post = require('../models/Post')
const config = require('../../util/settings')
const {
  OK,
  NOT_FOUND,
  UNAUTHORIZED,
  BAD_REQUEST
} = require('../../util/statusCodes')

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
      const id = mongoose.Types.ObjectId(decoded.id)

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
              message: 'Could not find any post'
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
        // likes: req.body.likes,
        // comments: req.body.comments,
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
  //   }
  // })
})

module.exports = router
