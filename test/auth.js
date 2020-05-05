/* global describe it before after */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

// Import the model being tested
const User = require('../api/models/User')

// Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const expect = chai.expect
const {
  OK,
  NOT_FOUND,
  UNAUTHORIZED,
  BAD_REQUEST,
  CONFLICT
} = require('../util/statusCodes')

// Setup Chai
chai.should()
chai.use(chaiHttp)

let serverInstance = null
let app = null

function initializeServer () {
  serverInstance = new server.Server()
  serverInstance.openConnection()
  app = serverInstance.getServerInstance()
}

function terminateServer (done) {
  serverInstance.closeConnection(done)
}

// Parent block for the User tests
describe('Users', () => {
  // Clear the database before the test beings
  before(done => {
    initializeServer()

    User.deleteMany({}, err => {
      if (err) {
        // Ignore the error
      }
      done()
    })
  })
  after(done => {
    terminateServer(done)
  })

  // Set a variable for the token that will be created during the login process
  // Used to access other APIs
  let token = ''

  // Check to see if the user exists
  describe('/POST checkIfEmailExists with no users added yet', () => {
    it('Should not return statusCode 200 when an email is not provided', done => {
      // Create an empty user
      const user = {}

      // Try to send the empty used to the API
      chai
        .request(app)
        .post('/api/auth/checkIfEmailExists')
        .send(user)
        .then(function (res) {
          // Expect to get a BAD_REQUEST back from the server
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 when a user does not exist', done => {
      const user = {
        email: 'a@b.c'
      }
      chai
        .request(app)
        .post('/api/auth/checkIfEmailExists')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST checkIfUsernameExists with no users added yet', () => {
    it('Should not return statusCode 200 when an username is not provided', done => {
      // Create an empty user
      const user = {}

      // Try to send the empty used to the API
      chai
        .request(app)
        .post('/api/auth/checkIfUsernameExists')
        .send(user)
        .then(function (res) {
          // Expect to get a BAD_REQUEST back from the server
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 when a user does not exist', done => {
      const user = {
        username: 'abc'
      }
      chai
        .request(app)
        .post('/api/auth/checkIfUsernameExists')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  // Register a user
  describe('/POST /api/auth/register', () => {
    it('Should not register a user without email, username or password', done => {
      const user = {}

      chai
        .request(app)
        .post('/api/auth/register')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should successfully register a user with email, username and password', done => {
      const user = {
        email: 'a@b.c',
        username: 'abc',
        password: 'StrongPassword$1'
      }

      chai
        .request(app)
        .post('/api/auth/register')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should not allow a second registration with the same email as a user in the database', done => {
      const user = {
        email: 'a@b.c',
        username: 'abc',
        password: 'StrongPassword$1'
      }

      chai
        .request(app)
        .post('/api/auth/register')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(CONFLICT)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  // Check if the user exists after registering the user above
  describe('/POST checkIfEmailExists with a user added', () => {
    it('Should return statusCode 409 when a user already exists', done => {
      const user = {
        email: 'a@b.c'
      }
      chai
        .request(app)
        .post('/api/auth/checkIfEmailExists')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(CONFLICT)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  // Login with the username and password created above
  describe('/POST /api/auth/login', () => {
    it('Should return statusCode 400 if an email and/or password is not provided', done => {
      const user = {}
      chai
        .request(app)
        .post('/api/auth/login')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 401 if an email/pass combo does not match a record in the DB', done => {
      const user = {
        email: 'nota@b.c',
        password: 'notpass'
      }
      chai
        .request(app)
        .post('/api/auth/login')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(UNAUTHORIZED)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 401 if the email exists but password is incorrect', done => {
      const user = {
        email: 'a@b.c',
        password: 'notpass'
      }
      chai
        .request(app)
        .post('/api/auth/login')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(UNAUTHORIZED)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 and a JWT token if the email/pass is correct', done => {
      const user = {
        email: 'a@b.c',
        password: 'StrongPassword$1'
      }
      chai
        .request(app)
        .post('/api/auth/login')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.be.a('object')
          res.body.should.have.property('token')
          token = res.body.token

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  // Verify the validity of the token
  describe('/POST /api/auth/verify', () => {
    it('Should return statusCode 401 when a token is not passed in', done => {
      chai
        .request(app)
        .post('/api/auth/verify')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 401 when an invalid token is passed in', done => {
      chai
        .request(app)
        .post('/api/auth/verify')
        .send({ token: 'Invalid Token' })
        .then(function (res) {
          expect(res).to.have.status(UNAUTHORIZED)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 when a valid token is passed in', done => {
      chai
        .request(app)
        .post('/api/auth/verify')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.be.a('object')
          res.body.should.have.property('email')

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST edit an account for adding a username', () => {
    it('Should return statusCode 409 when a queryEmail is not passed in', done => {
      const user = {
        token: token
      }

      chai
        .request(app)
        .post('/api/auth/edit')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(NOT_FOUND)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 404 when a queryEmail is not found', done => {
      const user = {
        queryEmail: 'a2@c.c',
        token: token
      }

      chai
        .request(app)
        .post('/api/auth/edit')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(NOT_FOUND)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 when a record was updated', done => {
      const user = {
        queryEmail: 'a@b.c',
        username: 'abc',
        token: token
      }

      chai
        .request(app)
        .post('/api/auth/edit')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  // Check if the user exists after registering the user above
  describe('/POST checkIfUsernameExists with a user added', () => {
    it('Should return statusCode 409 when a user already exists', done => {
      const user = {
        username: 'abc'
      }
      chai
        .request(app)
        .post('/api/auth/checkIfUsernameExists')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(CONFLICT)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 when a username doesnt exist', done => {
      const user = {
        username: 'bca'
      }
      chai
        .request(app)
        .post('/api/auth/checkIfUsernameExists')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST /api/auth/forgot-password', () => {
    it('Should return statusCode 400 if a email was not passed in', done => {
      chai
        .request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 if a email was passed in always', done => {
      chai
        .request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'a@b.c' })
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST /api/auth/updatePassword', () => {
    it('Should return statusCode 400 if token is not provided', done => {
      const user = {
        password: 'StrongPassword$1'
      }
      chai
        .request(app)
        .post('/api/auth/updatePassword')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 400 if password is not provided', done => {
      const user = {
        token: token
      }
      chai
        .request(app)
        .post('/api/auth/updatePassword')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 if successfully updated', done => {
      const user = {
        token: token,
        password: 'StrongPassword$1'
      }
      chai
        .request(app)
        .post('/api/auth/updatePassword')
        .send(user)
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST /api/auth/getUser', () => {
    it('Should return statusCode 400 if a token was not passed in', done => {
      chai
        .request(app)
        .post('/api/auth/getUser')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 if a user was found', done => {
      chai
        .request(app)
        .post('/api/auth/getUser')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.be.a('object')

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST /api/auth/deleteUser', () => {
    it('Should return statusCode 400 if a token was not passed in', done => {
      chai
        .request(app)
        .post('/api/auth/deleteUser')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    // create post
    it('Should return statusCode 200 if a post was created, to be deleted', done => {
      chai
        .request(app)
        .post('/api/posts/createPost')
        .send({ token: token, text: 'test post' })
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return an array of length 1 for the posts', done => {
      chai
        .request(app)
        .post('/api/posts/getPosts')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.be.a('array')
          res.body.should.be.length(1)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 if a user was deleted', done => {
      chai
        .request(app)
        .post('/api/auth/deleteUser')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    // get post should return 0
    it('Should return an array of length 0 for the posts', done => {
      chai
        .request(app)
        .post('/api/posts/getPosts')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.be.a('array')
          res.body.should.be.length(0)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })
})
