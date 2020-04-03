const http = require('http')
const bodyParser = require('body-parser')
const path = require('path')
const morgan = require('morgan')
const address = require('address')

// Configure Mongoose
const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const express = require('express')

// Import routes
const auth = require('./api/routes/auth')
const messages = require('./api/routes/messages')
const posts = require('./api/routes/posts')

// Set the port to 3000 for development and 8080 for production
const DEV =
  process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
const TEST = process.env.NODE_ENV === 'test'

// Utilize port 3000 for Development
// Utilize port 8080 for Production
const PORT = DEV ? '3000' : '8080'

// Name the database based if its in test mode or development/production
const DATABASE_NAME = TEST ? 'cmpe-133-test' : 'cmpe-133'

class Server {
  constructor () {
    this.mongoose = mongoose
    this.app = express()
    this.configureExpress()
  }

  configureExpress () {
    // Configure Express
    // Set the port
    this.app.set('port', PORT)

    // Use body-parser
    this.app.use(bodyParser.json({ limit: '1mb' }))
    this.app.use(
      bodyParser.urlencoded({
        extended: 'false'
      })
    )

    // Serve the index.html build
    this.app.use(express.static(path.join(__dirname, 'build')))

    // Route requests to index
    this.app.get('*', function (req, res) {
      res.sendFile(path.join(__dirname, '/build/index.html'))
    })

    // Use Morgan for additional logging in development
    if (DEV) {
      this.app.use(morgan('dev'))
    }
  }

  openConnection () {
    // Configure and connect to Mongoose
    // mongoose.Promise = require('bluebird')
    this.mongoose = mongoose
    this.mongoose
      .connect(`mongodb://localhost/${DATABASE_NAME}`, {
        promiseLibrary: require('bluebird'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
      })
      .then(() => {
        console.log(
          this.formatTerminalOutput({
            text: 'MongoDB Connection Successful',
            type: 'body'
          })
        )
        console.log()
      })
      .catch(error => console.error(error))

    this.mongoose.set('useFindAndModify', false)

    // Create HTTP server.
    this.server = http.createServer(this.app)

    const io = require('socket.io')(this.server)
    io.set('heartbeat timeout', 90000) // 90 sec
    io.set('heartbeat interval', 60000) // 60 sec

    const users = []

    io.on('connection', socket => {
      // get list of online users when connecting
      socket.emit('online-users', users)

      socket.on('message', payload => {
        socket.broadcast.emit('message', payload)
      })

      socket.on('start-typing', payload => {
        socket.broadcast.emit('user-started-typing', payload)
      })

      socket.on('stop-typing', payload => {
        socket.broadcast.emit('user-stopped-typing', payload)
      })

      socket.on('user-connected', userId => {
        users.push({
          userId: userId,
          socketId: socket.id
        })
        socket.broadcast.emit('online-users', users)
      })

      // Disconnect
      socket.on('disconnect', () => {
        users.splice(users.map(user => user.socketId).indexOf(socket.id), 1)
        socket.broadcast.emit('online-users', users)
      })
    })

    // Routes for all APIs here
    this.app.use('/api/auth', auth)
    this.app.use('/api/messages', messages)
    this.app.use('/api/posts', posts)

    // Catch 404 and forward to error handler
    // if not in test mode
    if (!TEST) {
      this.app.use(function (req, res, next) {
        const error = new Error('Not Found')
        error.status = 404
        next(error)
      })
    }

    // Error handler
    this.app.use(function (error, req, res, next) {
      console.log(error)

      if (!DEV) delete error.stack

      res.status(error.statusCode || 500).json(error)
    })

    // Listen on provided port, on all network interfaces.
    this.server.listen(PORT, error => {
      if (error) throw error

      // Avoid printing the following output
      // while mocha & chai are running
      if (!TEST) {
        this.clearTerminal()
        console.log(
          this.formatTerminalOutput({ text: 'DONE', type: 'title' }) +
            ' ' +
            this.formatTerminalOutput({
              text: 'Compiled Successfully',
              type: 'body'
            })
        )
        console.log()
        console.log('You can view the app in the browser:')
        console.log()
        console.log(
          `Local:               http://localhost:${this.server.address().port}`
        )
        console.log(
          `On Your Network:     http://${address.ip()}:${
            this.server.address().port
          }`
        )
        console.log()

        if (!DEV) {
          console.log(
            'To utilize hot reloading for development, open a new terminal and run `npm run dev`'
          )
          console.log()
        }
      }
    })
  }

  closeConnection (done) {
    this.server.close()
    this.mongoose.connection.close(done)
  }

  getServerInstance () {
    return this.server
  }

  // Utility functions for terminal output formatting
  formatTerminalOutput (options) {
    const GREEN_TEXT = '\x1b[32m'
    const BLACK_TEXT = '\x1b[30m'
    const RESET_TEXT = '\x1b[0m'
    const GREEN_BG = '\x1b[42m'

    if (options.type === 'title') {
      return `${GREEN_BG}${BLACK_TEXT} ${options.text} ${RESET_TEXT}`
    } else {
      return `${GREEN_TEXT}${options.text}${RESET_TEXT}`
    }
  }

  clearTerminal () {
    const CLEAR_CONSOLE = '\x1Bc'

    process.stdout.write(CLEAR_CONSOLE)
  }
}

if (typeof module !== 'undefined' && !module.parent) {
  const server = new Server()
  server.openConnection()
}

// Export the server so Mocha & Chai can have access to it
module.exports = { Server }
