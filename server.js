const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const morgan = require('morgan')
const http = require('http')
const address = require('address')
const mongoose = require('mongoose')

// Import routes
const auth = require('./api/routes/auth')

// Set the port to 3000 for development and 8080 for production
const DEV = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
const TEST = process.env.NODE_ENV === 'test'

// Utilize port 3000 for Development
// Utilize port 8080 for Production
const PORT = DEV ? '3000' : '8080'

// Name the database based if its in test mode or development/production
const DATABASE_NAME = TEST ? 'mern-auth-test' : 'mern-auth'

// Configure and connect to Mongoose
mongoose.Promise = require('bluebird')
mongoose.connect(
  `mongodb://localhost/${DATABASE_NAME}`,
  {
    promiseLibrary: require('bluebird'),
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log(formatTerminalOutput({ text: 'MongoDB Connection Successful', type: 'body' }))
    console.log()
  })
  .catch((error) => console.error(error))

// Configure Express
// Set the port
app.set('port', PORT)

// Use body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: 'false' }))

// Serve the index.html build
app.use(express.static(path.join(__dirname, 'build')))

// Route requests to index
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/build/index.html'))
})

// Use Morgan for additional logging in development
if (DEV) {
  app.use(morgan('dev'))
}

// Routes for all APIs here
app.use('/api/auth', auth)

// Catch 404 and forward to error handler
// if not in test mode
if (!TEST) {
  app.use(function (req, res, next) {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
  })
}

// Error handler
app.use(function (error, req, res, next) {
  console.log(error)

  if (!DEV) delete error.stack

  res.status(error.statusCode || 500).json(error)
})

// Create HTTP server.
const server = http.createServer(app)

// Listen on provided port, on all network interfaces.
server.listen(PORT, error => {
  if (error) throw error

  // Avoid printing the following output
  // while mocha & chai are running
  if (!TEST) {
    clearTerminal()
    console.log(
      formatTerminalOutput({ text: 'DONE', type: 'title' }) +
      ' ' +
      formatTerminalOutput({ text: 'Compiled Successfully', type: 'body' })
    )
    console.log()
    console.log('You can view the app in the browser:')
    console.log()
    console.log(`Local:               http://localhost:${server.address().port}`)
    console.log(`On Your Network:     http://${address.ip()}:${server.address().port}`)
    console.log()

    if (!DEV) {
      console.log('To utilize hot reloading for development, open a new terminal and run `npm run dev`')
      console.log()
    }
  }
})

// Utility functions for terminal output formatting
function formatTerminalOutput (options) {
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

function clearTerminal () {
  const CLEAR_CONSOLE = '\x1Bc'

  process.stdout.write(CLEAR_CONSOLE)
}

// Export the server so Mocha & Chai can have access to it
module.exports = server
