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
  BAD_REQUEST,
  CONFLICT
} = require('../../util/statusCodes')

// Check if the user exists
// @parameter username: String
// @return: statusCode
router.post('/checkIfUsernameExists', (req, res) => {
  // If a username is passed in, return a BAD_REQUEST
  if (!req.body.username) {
    return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
  }

  // Try and find the user in the database
  User.findOne(
    {
      username: req.body.username.toLowerCase()
    },
    function (error, user) {
      if (error) {
        // Bad Request
        return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
      }

      if (!user) {
        // Member username does not exist
        res.sendStatus(OK)
      } else {
        // User username does exist
        res.sendStatus(CONFLICT)
      }
    }
  )
})

// Check if the email exists
// @parameter email: String
// @return: statusCode
router.post('/checkIfEmailExists', (req, res) => {
  // If a email is not passed in, return a BAD_REQUEST
  if (!req.body.email) {
    return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
  }

  // Try and find the user in the database
  User.findOne(
    {
      email: req.body.email.toLowerCase()
    },
    function (error, user) {
      if (error) {
        // Bad Request
        return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
      }

      if (!user) {
        // Member email does not exist
        res.sendStatus(OK)
      } else {
        // User email does exist
        res.sendStatus(CONFLICT)
      }
    }
  )
})

router.post('/forgot-password', (req, res) => {
  // If a email is passed in, return a BAD_REQUEST
  if (!req.body.email) {
    return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
  }

  // This can be built out to support emails
  return res.sendStatus(OK)
})

router.post('/edit', (req, res) => {
  // Strip JWT from the token
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)

  const token = req.body.token.replace(/^JWT\s/, '')
  const query = { email: req.body.queryEmail }
  const user = {
    ...req.body
  }

  // Remove the auth token from the form getting edited
  delete user.queryEmail
  delete user.token
  delete user.password // don't allow password updates

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      // Build this out to search for a user
      if (!query.email) query.email = decoded.email
      User.updateOne(query, { ...user }, function (error, result) {
        if (error) res.status(BAD_REQUEST).send({ message: 'Bad Request.' })

        if (result.nModified < 1) {
          return res
            .status(NOT_FOUND)
            .send({ message: `${req.body.queryEmail} not found.` })
        }

        return res
          .status(OK)
          .send({ message: `${req.body.queryEmail} was updated.` })
      })
    }
  })
})

router.post('/updatePassword', (req, res) => {
  // Strip JWT from the token
  if (!req.body.token || !req.body.password) return res.sendStatus(BAD_REQUEST)

  const token = req.body.token.replace(/^JWT\s/, '')
  const query = { email: req.body.queryEmail }
  const password = req.body.password

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      // Build this out to search for a user
      if (!query.email) query.email = decoded.email

      User.findOne(
        {
          ...query
        },
        function (error, user) {
          if (error) {
            // Bad Request
            return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
          }

          if (!user) {
            // Unauthorized if the email does not match any records in the database
            res.status(404).send({ message: 'User not found.' })
          } else {
            user.password = password
            user.save(function (error) {
              if (error) {
                // Confict
                res.sendStatus(CONFLICT)
              } else {
                // Ok
                res.sendStatus(OK)
              }
            })
          }
        }
      )
    }
  })
})

// Registers a new user if the email is unique
// @parameter email: String
// @parameter username: String
// @parameter password: String
// @return statusCode
router.post('/register', function (req, res) {
  // If the username, email or password isn't supplied, return a BAD_REQUEST
  if (!req.body.email || !req.body.password) {
    return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
  }

  // Create a new user with the supplied username and password
  if (req.body.email && req.body.password) {
    const newUser = new User({
      email: req.body.email,
      password: req.body.password
    })

    // Test the password to ensure the password policy
    // is enforced
    const testPassword = testPasswordStrength(req.body.password)

    // If it doesnt meet the policy, retrun a BAD_REQUEST
    if (!testPassword.success) {
      // Bad Request
      return res.status(BAD_REQUEST).send({ message: testPassword.message })
    }

    // Otherwise try to save the user to the database
    newUser.save(function (error) {
      if (error) {
        // Confict because another user with that username exists
        res.status(CONFLICT).send({ message: 'Username already exists.' })
      } else {
        // Ok
        res.sendStatus(OK)
      }
    })
  }
})

// Logs the user in if the password and username match the database
// @parameter email: String
// @paratmeter password: String
// @return: statusCode & JWT token
router.post('/login', function (req, res) {
  // If the email or password isn't supplied, return a BAD_REQUEST
  if (!req.body.email || !req.body.password) {
    return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
  }

  // Try and find a user in the database
  User.findOne(
    {
      email: req.body.email
    },
    function (error, user) {
      if (error) {
        // Bad Request
        return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
      }

      if (!user) {
        // Unauthorized if the email does not match any records in the database
        res
          .status(UNAUTHORIZED)
          .send({ message: 'Email or password does not match our records.' })
      } else {
        // Check if password matches database
        user.comparePassword(req.body.password, function (error, isMatch) {
          if (isMatch && !error) {
            // If the email and password matches the database, assign and
            // return a jwt token

            // Set the expiration time
            const jwtOptions = {
              expiresIn: req.body.remember ? '7d' : '4h' // 7 days or 4 hours
            }

            // Data to be passed to the token stored in Local Storage
            const userToBeSigned = {
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImg: user.profileImg,
              email: user.email,
              lastLogin: user.lastLogin,
              id: user.id,
              isOnboarded: user.isOnboarded
            }

            // Sign the token using the data provided above, the secretKey and JWT options
            const token = jwt.sign(userToBeSigned, config.secretKey, jwtOptions)
            res
              .status(OK)
              .send({ token: 'JWT ' + token, lastLogin: user.lastLogin })
          } else {
            // Unauthorized
            res.status(UNAUTHORIZED).send({
              message: 'Email or password does not match our records.'
            })
          }
        })
      }
    }
  )
})

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
          email: decoded.email
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
              username: user.username
            })
          }
        }
      )
    }
  })
})

// TEMP while the Friends function is being created
router.post('/getAllUsers', function (req, res) {
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
            res.status(OK).send(users)
          }
        })

      // User.find(
      //   {
      //     _id: { $not: { $eq: id } }
      //   },
      //   function (error, users) {
      //     if (error) {
      //       // Bad Request
      //       return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
      //     }
      //
      //     if (!users) {
      //       // Unauthorized if the email does not match any records in the database
      //       res.status(NOT_FOUND).send({
      //         message: 'Could not find any users'
      //       })
      //     } else {
      //       // Check if password matches database
      //       res.status(OK).send(users)
      //     }
      //   }
      // )
    }
  })
})

router.post('/deleteUser', (req, res) => {
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)

  const token = req.body.token.replace(/^JWT\s/, '')

  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      User.deleteOne({ email: decoded.email }, (error, entries) => {
        if (error) {
          return res.sendStatus(BAD_REQUEST)
        }

        return res.status(OK).send(entries)
      })
    }
  })
})

// Verifies the users session if they have an active jwtToken.
// Used on the inital load of root '/'
// @parameter token: String
// @return: statusCode
router.post('/verify', function (req, res) {
  // If no token provided, then return a BAD_REQUEST
  if (!req.body.token) return res.sendStatus(BAD_REQUEST)

  // Strip JWT from the token
  const token = req.body.token.replace(/^JWT\s/, '')

  // Try and verify the token
  jwt.verify(token, config.secretKey, function (error, decoded) {
    if (error) {
      // Unauthorized
      res.sendStatus(UNAUTHORIZED)
    } else {
      // Ok
      res.status(OK).send(decoded)
    }
  })
})

// Helpers to test the passwordStrength according to the policy
function testPasswordStrength (password) {
  const passwordStrength = config.passwordStrength || 'strong'
  /* eslint-disable */
  const strongRegex = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
  )
  const strongMessage =
    'Invalid password. Requires 1 uppercase, 1 lowercase, 1 number and 1 special character: !@#$%^&'

  const mediumRegex = new RegExp(
    '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})'
  )
  const mediumMessage =
    'invalid password. Requires 1 uppercase or lowercase and 1 number'
  /* eslint-enable */

  // test the password against the strong regex & return true if it passes
  if (passwordStrength === 'strong') {
    return { success: strongRegex.test(password), message: strongMessage }
  }

  // test medium password by default
  return { success: mediumRegex.test(password), message: mediumMessage }
}

module.exports = router
