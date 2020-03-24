/* global describe it before after */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

// Import the model being tested
const Message = require('../api/models/Message')
const MessageImage = require('../api/models/MessageImage')
const Conversation = require('../api/models/Conversation')

// Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const expect = chai.expect
const {
  OK,
  UNAUTHORIZED,
  BAD_REQUEST
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
describe('Messages', () => {
  // Clear the database before the test beings
  before(done => {
    initializeServer()

    Message.deleteMany({}, err => {
      if (err) {
        // Ignore the error
      }
      MessageImage.deleteMany({}, err => {
        if (err) {
          // Ignore the error
        }
        Conversation.deleteMany({}, err => {
          if (err) {
            // Ignore the error
          }
          done()
        })
      })
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
    it('Should successfully register b@b.c with email and password', done => {
      const user = {
        email: 'b@b.c',
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

    it('Should successfully register c@b.c with email and password', done => {
      const user = {
        email: 'c@b.c',
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
    it('Should return statusCode 200 and a JWT token if the email/pass is correct for c@b.c', done => {
      const user = {
        email: 'c@b.c',
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

    it('Should return statusCode 200 and a JWT token if the email/pass is correct for b@b.c', done => {
      const user = {
        email: 'b@b.c',
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

  describe('/POST /api/messages/getConversationList', () => {
    it('Should return statusCode 400 if no token is passed in', done => {
      chai
        .request(app)
        .post('/api/messages/getConversationList')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 401 if an incorrect token is passed in', done => {
      chai
        .request(app)
        .post('/api/messages/getConversationList')
        .send({ token: 'JWT incorrect token' })
        .then(function (res) {
          expect(res).to.have.status(UNAUTHORIZED)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 with an array of conversations', done => {
      chai
        .request(app)
        .post('/api/messages/getConversationList')
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

  describe('/POST /api/messages/getConversationMessages', () => {
    it('Should return statusCode 400 if no token is passed in', done => {
      chai
        .request(app)
        .post('/api/messages/getConversationMessages')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 401 if an incorrect token is passed in', done => {
      chai
        .request(app)
        .post('/api/messages/getConversationMessages')
        .send({ token: 'JWT incorrect token' })
        .then(function (res) {
          expect(res).to.have.status(UNAUTHORIZED)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 with an array of messages', done => {
      chai
        .request(app)
        .post('/api/messages/getConversationList')
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

  describe('/POST /api/messages/sendMessage', () => {
    it('Should return statusCode 400 if no token is passed in', done => {
      chai
        .request(app)
        .post('/api/messages/sendMessage')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 401 if an incorrect token is passed in', done => {
      chai
        .request(app)
        .post('/api/messages/sendMessage')
        .send({ token: 'JWT incorrect token' })
        .then(function (res) {
          expect(res).to.have.status(UNAUTHORIZED)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 if a message was sent', done => {
      chai
        .request(app)
        .post('/api/messages/sendMessage')
        .send({
          token: token,
          id: id,
          message: 'some text',
          type: 'message'
        })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.have.property('conversationId')

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return statusCode 200 if a message with an image was sent', done => {
      chai
        .request(app)
        .post('/api/messages/sendMessage')
        .send({
          token: token,
          to: id,
          data: 'img data...',
          name: 'img.png',
          type: 'image'
        })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.have.property('conversationId')

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST /api/messages/getConversationList', () => {
    it('Should return statusCode 200 with an array of conversations', done => {
      chai
        .request(app)
        .post('/api/messages/getConversationList')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.be.a('array')
          res.body.should.be.length(2)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST /api/messages/getConversationMessages', () => {
    it('Should return statusCode 200 with an array of messages', done => {
      chai
        .request(app)
        .post('/api/messages/getConversationList')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.be.a('array')
          res.body.should.be.length(2)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })
})
