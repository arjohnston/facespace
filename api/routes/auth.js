const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const passport = require('passport')
require('../config/passport')(passport)
const User = require('../models/user')
const config = require('../../util/settings')
const { OK, UNAUTHORIZED, BAD_REQUEST, CONFLICT } = require('../../util/statusCodes')

// Check if the user exists
// @parameter username: String
// @return: statusCode
router.post('/checkIfUserExists', (req, res) => {
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

// Registers a new user if the username is unique
// @parameter username: String
// @parameter password: String
// @return statusCode
router.post('/register', function (req, res) {
  // If the username or password isn't supplied, return a BAD_REQUEST
  if (!req.body.username || !req.body.password) return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })

  // Create a new user with the supplied username and password
  if (req.body.username && req.body.password) {
    const newUser = new User({
      username: req.body.username,
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
// @parameter username: String
// @paratmeter password: String
// @return: statusCode & JWT token
router.post('/login', function (req, res) {
  // If the username or password isn't supplied, return a BAD_REQUEST
  if (!req.body.username || !req.body.password) return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })

  // Try and find a user in the database
  User.findOne({
    username: req.body.username
  }, function (error, user) {
    if (error) {
      // Bad Request
      return res.status(BAD_REQUEST).send({ message: 'Bad Request.' })
    }

    if (!user) {
      // Unauthorized if the username does not match any records in the database
      res.status(UNAUTHORIZED).send({ message: 'Username or password does not match our records.' })
    } else {
      // Check if password matches database
      user.comparePassword(req.body.password, function (error, isMatch) {
        if (isMatch && !error) {
          // If the username and password matches the database, assign and
          // return a jwt token

          // Set the expiration time
          const jwtOptions = {
            expiresIn: '2h' // 2 hours
          }

          // Data to be passed to the token stored in Local Storage
          const userToBeSigned = {
            username: user.username
          }

          // Sign the token using the data provided above, the secretKey and JWT options
          const token = jwt.sign(userToBeSigned, config.secretKey, jwtOptions)
          res.status(OK).send({ token: 'JWT ' + token })
        } else {
          // Unauthorized
          res.status(UNAUTHORIZED).send({ message: 'Username or password does not match our records.' })
        }
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
  if (!req.body.token) {
    return res.sendStatus(BAD_REQUEST)
  }

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
  const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})')
  const strongMessage = 'Invalid password. Requires 1 uppercase, 1 lowercase, 1 number and 1 special character: !@#\$%\^&'

  const mediumRegex = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})')
  const mediumMessage = 'invalid password. Requires 1 uppercase or lowercase and 1 number'
  /* eslint-enable */

  // test the password against the strong regex & return true if it passes
  if (passwordStrength === 'strong') return { success: strongRegex.test(password), message: strongMessage }

  // test medium password by default
  return { success: mediumRegex.test(password), message: mediumMessage }
}

module.exports = router
