const cp = require('child_process')
const fs = require('fs')
const path = require('path')
const address = require('address')

const options = {
  // Default strong password
  passwordStrength: 'strong'
}

const platform = process.platform

// Generic function to run commands through NodeJS
// @parameter cmd: String
// @parameter msg: String
// @return promise
function runChildProcessExec (cmd, verbose = false, msg = '') {
  // Return immediately if there are no commands passed in
  if (!cmd) return

  // Print out the message passed in
  // if (msg !== '') console.log(`[${formatOutput(' ')}] ` + msg)
  if (msg !== '') console.log(msg)

  // Return a promise once the execute command succeeds or throws
  // an error
  return new Promise((resolve, reject) => {
    // Execute the command
    cp.exec(cmd, function (error, stdout, stderr) {
      // Reject if there is an error
      if (error) {
        reject(new Error(error))
      } else {
        // Improve this line to clear the previous line, then print this one...
        // console.log(`[${formatOutput('', 'checkmark')}] ` + msg)
        // Otherwise, if utilizing vebose as an option, then print
        // all statements passed back by the execute command
        if (stderr && verbose) console.log(stderr)
        if (stdout && verbose) console.log(stdout)

        // Resolve the promise
        resolve()
      }
    })
  })
}

// Check to see if the config file already exists
// If it does, verify it has the required fields.
// Otherwise, create it
// Creates the configuration file
// @return: promise
function configure () {
  // Utlity function to create a simple hash to be used as a
  // JWT secret key
  // @return: String
  function createSecretKey () {
    // All available characters to be included in the hash
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    // Result of the hash
    let result = ''

    // Length of the hash to be returned
    const HASH_LENGTH = 64

    // For loop for the hash length, utilizing random numbers
    for (let i = HASH_LENGTH; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }

    // Return the hash
    return result
  }
  return new Promise((resolve, reject) => {
    try {
      const configFile = require('../settings')

      if (
        configFile.secretKey !== null &&
        configFile.passwordStrength !== null &&
        configFile.platform !== undefined
      ) {
        return resolve()
      }
    } catch (error) {
      console.log(
        formatOutput(
          'The configuration file does not exist or have the required fields.',
          'warn'
        )
      )
    }

    // secretKey is used to generate a unique jwtToken
    // This key should be changed from it's default to a mix of
    // random characters, numbers and symbols. At least 25 characters long
    // To generate a random key, visit https://www.lastpass.com/password-generator
    const jwtSecretKey = createSecretKey()

    // The configuration that the config.json will be generated from
    const config = {
      secretKey: jwtSecretKey,
      passwordStrength: options.passwordStrength,
      platform: platform
    }

    console.log('Creating the configuration file...')

    // Try to write a file to the config.file
    fs.writeFile(
      path.join(__dirname, '../../api/config/config.json'),
      JSON.stringify(config, null, 2),
      (error, result) => {
        if (error) return reject(new Error(error))

        console.log(
          formatOutput(
            'Successfully created the configuration file\n',
            'success'
          )
        )

        // Resolve the promise
        resolve()
      }
    )
  })
}

function checkDependencies () {
  return new Promise((resolve, reject) => {
    runChildProcessExec('npm -v', false, 'Checking if NPM is installed')
      .then(() => {
        return runChildProcessExec(
          'mongo --version',
          false,
          'Checking if Mongo is installed'
        )
      })
      .then(() => {
        return runChildProcessExec(
          'pm2 -v',
          false,
          'Checking if PM2 is installed'
        )
      })
      .then(() => {
        resolve()
      })
      .catch(err =>
        console.log(
          formatOutput(
            `An error was encountered. Try installing the dependencies with python setup.py\n${err}`,
            'error'
          )
        )
      )
  })
}

function start () {
  // Windows mongod start:
  // "C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="c:\data\db"

  // setProd:
  // set NODE_ENV=production
  const commands = {
    pm2Stop: 'pm2 stop api database && pm2 delete api database',
    mongo: 'pm2 start mongod --name "database" -- --dbpath=/Volumes/data/db/',
    npmInstall: 'npm install',
    npmBuild: './node_modules/.bin/react-scripts build',
    startWindowsApi:
      'set NODE_ENV=production && pm2 start npm --name "api" -- start',
    startApi: 'pm2 start ecosystem.config.js',
    frontEnd: './node_modules/.bin/react-scripts start'
  }

  function stopPm2 () {
    return new Promise((resolve, reject) => {
      runChildProcessExec(
        commands.pm2Stop,
        true,
        'Stopping PM2, if initialized'
      )
        .then(() => {
          resolve()
        })
        .catch(() => {
          resolve()
        })
    })
  }

  process.on('SIGINT', () => {
    stopPm2().then(() => {
      console.log('Stopped PM2 services')
      process.exit(1)
    })
  })

  let uiStarted = false

  checkDependencies()
    .then(() => {
      return stopPm2()
    })
    .then(() => {
      return runChildProcessExec(commands.mongo, true, 'Starting MongoDB')
    })
    .then(() => {
      return runChildProcessExec(
        commands.npmInstall,
        true,
        'Installing dependencies'
      )
    })
    .then(() => {
      return runChildProcessExec(commands.npmBuild, true, 'Creating a build')
    })
    .then(() => {
      return runChildProcessExec(commands.startApi, true, 'Starting the APIs')
    })
    .then(() => {
      // Start the UI
      uiStarted = true

      clearTerminal()
      console.log(formatOutput('Compiled Successfully.'))
      console.log()
      console.log('You can view the app in the browser:')
      console.log()
      console.log('Local:               http://localhost:3000')
      console.log(`On Your Network:     http://${address.ip()}:3000`)
      console.log()

      return runChildProcessExec(commands.frontEnd, true)
    })
    .catch(
      err =>
        !uiStarted &&
        console.log(formatOutput(`An error was encountered.\n${err}`, 'error'))
    )
}

function clearTerminal () {
  const CLEAR_CONSOLE = '\x1Bc'

  process.stdout.write(CLEAR_CONSOLE)
}

// Format the text of a message to be outputed into a terminal (tested on MacOS iTerm2)
// @parameter msg: string
// @parameter type: string (success, warn, error)
// @return: String
function formatOutput (msg, type) {
  const RED_TEXT = '\x1b[31m'
  const GREEN_TEXT = '\x1b[32m'
  const YELLOW_TEXT = '\x1b[33m'
  const RESET_TEXT = '\x1b[0m' // Reset is required to return the text color back to normal
  const CHECK_MARK = '\u2714'
  const CROSS = '\u274c'

  // Only tested on MacOS at the moment. Branch out as other platforms are available
  if (platform === 'darwin') {
    switch (type) {
      case 'success':
      case undefined:
        // String with a check mark and green text
        return `${GREEN_TEXT}${type ? CHECK_MARK + ' ' : ''}${msg}${RESET_TEXT}`

      case 'checkmark':
        // String with a check mark and green text
        return `${GREEN_TEXT}${CHECK_MARK}${RESET_TEXT}`

      case 'warn':
        // String with yellow text
        return `${YELLOW_TEXT}${msg}${RESET_TEXT}`

      case 'error':
        // String with cross and red text
        return `${RED_TEXT}${CROSS}  ${msg}${RESET_TEXT}`

      default:
        // Return the default string if unknown
        return msg
    }
  } else {
    return msg
  }
}

// By default run the checkArgs function
// checkArgs()
configure().then(() => {
  start()
})
