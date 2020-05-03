/* global describe it before after */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

// Import the model being tested
const Post = require('../api/models/Post')

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
describe('Posts', () => {
  // Clear the database before the test beings
  before(done => {
    initializeServer()

    Post.deleteMany({}, err => {
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
    it('Should successfully register d@b.c with email and password', done => {
      const user = {
        email: 'd@b.c',
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

    it('Should successfully register e@b.c with email and password', done => {
      const user = {
        email: 'e@b.c',
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
    it('Should return statusCode 200 and a JWT token if the email/pass is correct for d@b.c', done => {
      const user = {
        email: 'd@b.c',
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

    it('Should return status code 200 when creating a post', done => {
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

    it('Should return statusCode 200 and a JWT token if the email/pass is correct for e@b.c', done => {
      const user = {
        email: 'e@b.c',
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

  describe('/POST /api/posts/getPosts', () => {
    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/posts/getPosts')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return an array of length 0 for the self user', done => {
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

    it('Should return an array of length 1 for another user who already created a post', done => {
      chai
        .request(app)
        .post('/api/posts/getPosts')
        .send({ token: token, queryId: id })
        .then(function (res) {
          expect(res).to.have.status(OK)
          res.body.should.be.a('array')
          res.body.should.be.length(1)

          res.body[0].should.be.a('object')
          res.body[0].should.have.property('text')
          res.body[0].should.have.property('likes')
          res.body[0].should.have.property('comments')
          res.body[0].should.have.property('user')
          res.body[0].should.have.property('_id')
          res.body[0].should.have.property('date')

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST /api/posts/createPost', () => {
    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/posts/createPost')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return status code 200 when creating a post', done => {
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

    it('Should return status code 200 when creating a second post', done => {
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

    it('Should return an array of length 2 for the self user', done => {
      chai
        .request(app)
        .post('/api/posts/getPosts')
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

    it('Should return an array of length 1 for another user who already created a post', done => {
      chai
        .request(app)
        .post('/api/posts/getPosts')
        .send({ token: token, queryId: id })
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

  describe('/POST /api/posts/edit', () => {
    let postId = ''

    it('Should return an array of posts for the user', done => {
      chai
        .request(app)
        .post('/api/posts/getPosts')
        .send({ token: token, queryId: id })
        .then(function (res) {
          expect(res).to.have.status(OK)
          postId = res.body[0]._id

          expect(res.body[0].text).to.equal('test post')

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/posts/edit')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return status code 400 when no postId is passed in', done => {
      chai
        .request(app)
        .post('/api/posts/edit')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should edit the specified post', done => {
      chai
        .request(app)
        .post('/api/posts/edit')
        .send({ token: token, postId: postId, text: 'edited post' })
        .then(function (res) {
          expect(res).to.have.status(OK)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return an array of posts for the user with the edited post', done => {
      chai
        .request(app)
        .post('/api/posts/getPosts')
        .send({ token: token, queryId: id })
        .then(function (res) {
          expect(res).to.have.status(OK)
          postId = res.body[0]._id

          expect(res.body[0].text).to.equal('edited post')

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })

  describe('/POST /api/posts/getFeed', () => {
    it('Should return status code 400 when no token is passed in', done => {
      chai
        .request(app)
        .post('/api/posts/getFeed')
        .send({})
        .then(function (res) {
          expect(res).to.have.status(BAD_REQUEST)

          done()
        })
        .catch(err => {
          throw err
        })
    })

    it('Should return array of posts of length 2, since I have no friends :(...', done => {
      chai
        .request(app)
        .post('/api/posts/getFeed')
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

    it('Should add friend', done => {
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

    it('Should return array of posts of length 3, since I have friends!', done => {
      chai
        .request(app)
        .post('/api/posts/getFeed')
        .send({ token: token })
        .then(function (res) {
          expect(res).to.have.status(OK)

          res.body.should.be.a('array')
          res.body.should.be.length(3)

          done()
        })
        .catch(err => {
          throw err
        })
    })
  })
})
