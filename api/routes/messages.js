const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const mongoose = require('mongoose')
// const passport = require('passport')
// require('../config/passport')(passport)
const Message = require('../models/Message')
const MessageImage = require('../models/MessageImage')
const Conversation = require('../models/Conversation')
const config = require('../../util/settings')
const { OK, UNAUTHORIZED, BAD_REQUEST } = require('../../util/statusCodes')

router.post('/getConversationList', (req, res) => {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const from = mongoose.Types.ObjectId(decoded.id)

      Conversation.aggregate([
        {
          $lookup: {
            from: 'User',
            localField: 'recipients',
            foreignField: '_id',
            as: 'recipientObj'
          }
        }
      ])
        .match({ recipients: { $all: [{ $elemMatch: { $eq: from } }] } })
        .project({
          'recipientObj.password': 0,
          'recipientObj.__v': 0
        })
        .exec((err, conversations) => {
          if (err) {
            return res.status(BAD_REQUEST).send({ message: 'Failure.' })
          } else {
            res.status(OK).send(conversations)
          }
        })
    }
  })
})

router.post('/getConversationMessages', (req, res) => {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const user1 = mongoose.Types.ObjectId(decoded.id)
      const user2 = mongoose.Types.ObjectId(req.body.userId)

      const messagesArray = []

      const promises = []

      promises.push(
        new Promise((resolve, reject) =>
          Message.aggregate([
            {
              $lookup: {
                from: 'users',
                localField: 'to',
                foreignField: '_id',
                as: 'toObj'
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'from',
                foreignField: '_id',
                as: 'fromObj'
              }
            }
          ])
            .match({
              $or: [
                { $and: [{ to: user1 }, { from: user2 }] },
                { $and: [{ to: user2 }, { from: user1 }] }
              ]
            })
            .project({
              'toObj.password': 0,
              'toObj.__v': 0,
              'fromObj.password': 0,
              'fromObj.__v': 0
            })
            .exec((err, messages) => {
              if (err) {
                return res.status(BAD_REQUEST).send({ message: 'Failure.' })
              } else {
                for (const message in messages) {
                  messages[message].type = 'message'
                }
                // res.send(messages)
                messagesArray.push(...messages)
                resolve()
              }
            })
        )
      )

      promises.push(
        new Promise((resolve, reject) =>
          MessageImage.aggregate([
            {
              $lookup: {
                from: 'users',
                localField: 'to',
                foreignField: '_id',
                as: 'toObj'
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'from',
                foreignField: '_id',
                as: 'fromObj'
              }
            }
          ])
            .match({
              $or: [
                { $and: [{ to: user1 }, { from: user2 }] },
                { $and: [{ to: user2 }, { from: user1 }] }
              ]
            })
            .project({
              'toObj.password': 0,
              'toObj.__v': 0,
              'fromObj.password': 0,
              'fromObj.__v': 0
            })
            .exec((err, images) => {
              if (err) {
                return res.status(BAD_REQUEST).send({ message: 'Failure.' })
              } else {
                for (const image in images) {
                  images[image].type = 'image'
                }
                messagesArray.push(...images)
                resolve()
              }
            })
        )
      )

      Promise.all(promises).then(() => {
        messagesArray.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        return res.status(OK).send(messagesArray)
      })
    }
  })
})

router.post('/sendMessage', (req, res) => {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)
  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      const from = mongoose.Types.ObjectId(decoded.id)
      const to = mongoose.Types.ObjectId(req.body.to)

      const query = {
        recipients: {
          $all: [{ $elemMatch: { $eq: from } }, { $elemMatch: { $eq: to } }]
        }
      }

      const updateInfo = {
        recipients: [decoded.id, req.body.to],
        lastMessage: req.body.message,
        date: Date.now()
      }

      const options = { upsert: true, new: true, setDefaultsOnInsert: true }

      Conversation.findOneAndUpdate(query, updateInfo, options, function (
        err,
        conversation
      ) {
        if (err) {
          return res.status(BAD_REQUEST).send({ message: 'Failure.' })
        } else {
          if (req.body.type === 'message') {
            const message = new Message({
              conversation: conversation._id,
              to: req.body.to,
              from: decoded.id,
              message: req.body.message
            })

            req.io.sockets.emit('message', {
              conversation: conversation._id,
              to: req.body.to,
              from: decoded.id,
              message: req.body.message,
              date: Date.now(),
              type: 'message'
            })

            return message.save(err => {
              if (err) {
                return res.status(BAD_REQUEST).send({ message: 'Failure.' })
              } else {
                return res
                  .status(OK)
                  .send({
                    message: 'Success',
                    conversationId: conversation._id
                  })
              }
            })
          } else if (req.body.type === 'image') {
            const message = new MessageImage({
              conversation: conversation._id,
              to: req.body.to,
              from: decoded.id,
              data: req.body.imageSrc,
              name: req.body.imageAlt
            })

            req.io.sockets.emit('message', {
              conversation: conversation._id,
              to: req.body.to,
              from: decoded.id,
              data: req.body.imageSrc,
              name: req.body.imageAlt,
              date: Date.now(),
              type: 'image'
            })

            return message.save(err => {
              if (err) {
                return res.status(BAD_REQUEST).send({ message: 'Failure.' })
              } else {
                return res
                  .status(OK)
                  .send({
                    message: 'Success',
                    conversationId: conversation._id
                  })
              }
            })
          }

          return res.status(BAD_REQUEST).send({ message: 'Unknown issue.' })
        }
      })
    }
  })
})

module.exports = router
