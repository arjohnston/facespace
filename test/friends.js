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
const { OK, BAD_REQUEST } = require('../util/statusCodes')

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
describe('Friends', () => {
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
  let id = ''

  // Register a user
  describe('/POST /api/auth/register', () => {
    it('Should successfully register x@b.c with email and password', done => {
      const user = {
        email: 'x@b.c',
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

    it('Should successfully register y@b.c with email and password', done => {
      const user = {
        email: 'y@b.c',
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
  })

  // Login with the username and password created above
  describe('/POST /api/auth/login', () => {
    it('Should return statusCode 200 and a JWT token if the email/pass is correct for x@b.c', done => {
      const user = {
        email: 'x@b.c',
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

    it('Should return statusCode 200 when a valid token is passed in', done => {
      chai
        .request(app)
        .post('/api/auth/verify')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.be.a('object')
          res.body.should.have.property('id')
          id = res.body.id

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 and a JWT token if the email/pass is correct for y@b.c', done => {
      const user = {
        email: 'y@b.c',
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

  describe('/POST /api/friends/getFriends', () => {
    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/friends/getFriends')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return an array of length 0 since the user has no friends', done => {
      chai
        .request(app)
        .post('/api/friends/getFriends')
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

  describe('/POST /api/friends/getFriendRequests', () => {
    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/friends/getFriendRequests')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return an array of length 0 since the user has no friend requests', done => {
      chai
        .request(app)
        .post('/api/friends/getFriendRequests')
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

  describe('/POST /api/friends/getNonFriends', () => {
    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/friends/getNonFriends')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return an array of length 1 only one other user exists in the system', done => {
      chai
        .request(app)
        .post('/api/friends/getNonFriends')
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
  })

  describe('/POST /api/friends/addFriend', () => {
    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/friends/addFriend')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return status code 400 when a friendId is not passed in', done => {
      chai
        .request(app)
        .post('/api/friends/addFriend')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return status code 200 when a friend was added', done => {
      chai
        .request(app)
        .post('/api/friends/addFriend')
        .send({ token: token, friendId: id })
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return an array of length 1 after a friend was added when getting all friends', done => {
      chai
        .request(app)
        .post('/api/friends/getFriends')
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

    it('Should return an array of length 0 after a friend was added when getting all non friends', done => {
      chai
        .request(app)
        .post('/api/friends/getNonFriends')
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

  describe('/POST /api/friends/removeFriend', () => {
    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/friends/removeFriend')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return status code 400 when a friendId is not passed in', done => {
      chai
        .request(app)
        .post('/api/friends/removeFriend')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return status code 200 when a friend was removed', done => {
      chai
        .request(app)
        .post('/api/friends/removeFriend')
        .send({ token: token, friendId: id })
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return an array of length 0 after a friend was removed when getting friends', done => {
      chai
        .request(app)
        .post('/api/friends/getFriends')
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

    it('Should return an array of length 1 after a friend was removed when getting all non friends', done => {
      chai
        .request(app)
        .post('/api/friends/getNonFriends')
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
  })

  describe('/POST /api/friends/addFriendRequest', () => {
    it('Should return array of length 0 when getting friend requests', done => {
      chai
        .request(app)
        .post('/api/friends/getFriendRequests')
        .send({ token: token, friendId: id })
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

    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/friends/addFriendRequest')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return status code 400 when a friendId is not passed in', done => {
      chai
        .request(app)
        .post('/api/friends/addFriendRequest')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return status code 200 when a friendRequest was added', done => {
      chai
        .request(app)
        .post('/api/friends/addFriendRequest')
        .send({ token: token, friendId: id })
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return array of length 1 when getting friend requests', done => {
      chai
        .request(app)
        .post('/api/friends/getFriendRequests')
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

    it('Should return status code 200 when a friendRequest was added', done => {
      chai
        .request(app)
        .post('/api/friends/removeFriendRequest')
        .send({ token: token, friendId: id })
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return array of length 0 when getting friend requests', done => {
      chai
        .request(app)
        .post('/api/friends/getFriendRequests')
        .send({ token: token, friendId: id })
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
