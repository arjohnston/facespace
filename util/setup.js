// Abstract: Set up all required dependencies and setup mongodb
// To run: node setup.js
// Arguments:
// --verbose: (e.g. `node setup.js --verbose`): Prints outputs of each command ran
// --manual: (e.g. `node setup.js --manual`): Prints list of dependencies to be manually installed
// --weak, --medium: (e.g. `node setup.js --weak`): Sets the password strength policy to Weak
// --help: (e.g. `node setup.js --help`): Prints a list of available commands
// Multiple commands can be used together (e.g. `node setup.js --verbose weak`)

const cp = require('child_process')
const fs = require('fs')
const path = require('path')

// Get the arguments passed into this file
const args = process.argv

const options = {
  // Prints out additional readouts based on the command that's ran
  // during the setup process
  verbose: false,

  // Default strong password
  // To change the password policy to medium or weak, pass in the arguments
  // --medium or --weak respectively
  passwordStrength: 'strong'
}

// Check to see what arguments are passed in
function checkArgs () {
  // If the platform is win32, assume it's Windows & the commands outlined in this document
  // are not valid.
  // Manual installation is required for Windows users
  if (process.platform === 'win32') {
    console.log(
      'Unfortunately Windows requires manual installation of the dependencies\n'
    )

    // For windows users, print out the list of required dependencies
    printListOfDependencies()

    // Configure the required JSON file
    createConfigFile()

    // Exit from the configuration
    return
  }

  // If the verbose argument is passed in, then set the options
  // so the commands ran will print as verbose, otherwise
  // minimal output will be printed during the setup process
  if (
    args
      .toString()
      .toLowerCase()
      .includes('verbose')
  ) {
    // If verbose logging is requested, enable verbose logging
    options.verbose = true
  }

  // If manual is passed in, then print the list of depdendencies
  // and set up the configuration file
  if (
    args
      .toString()
      .toLowerCase()
      .includes('manual')
  ) {
    printListOfDependencies()

    createConfigFile()

    return
  }

  // If medium is passed in as an argument, set the passwordStrength
  // to medium
  if (
    args
      .toString()
      .toLowerCase()
      .includes('medium')
  ) {
    options.passwordStrength = 'medium'
  }

  // If weak is passed in as an argument, set the passwordStrength
  // to weak
  if (
    args
      .toString()
      .toLowerCase()
      .includes('weak')
  ) {
    options.passwordStrength = 'weak'
  }

  // If help is passed in as an argument, print the help function
  // Listing all available commands and an explanation of the password
  // policy
  if (
    args
      .toString()
      .toLowerCase()
      .includes('help')
  ) {
    help()

    // Exit out of the setup program
    return
  }

  // Otherwise, if it wasn't excited, run the setup function
  setup()
}

// Print all dependencies used by the application
function printListOfDependencies () {
  console.log('Required dependencies:')
  console.log(
    formatOutput('NodeJS ', 'warn'),
    'The Javascript engine used to power the app'
  )
  console.log(
    formatOutput('NPM ', 'warn'),
    'Package manager for installing Node modules'
  )
  console.log(
    formatOutput('PM2 ', 'warn'),
    'The process manager to spawn the daemons'
  )
  console.log(
    formatOutput('Brew ', 'warn'),
    'System package manager to install mongo'
  )
  console.log(formatOutput('MongoDB ', 'warn'), 'The database used')
  console.log()
  console.log(
    'Once each of the depedencies are installed, the database will need\nto be configured according to your operating system'
  )
  console.log()
}

// Print a list of all available arguments and password policy
function help () {
  console.log('Available arguments:')
  console.log(
    '--verbose: (e.g. `node setup.js --verbose`): Prints outputs of each command ran'
  )
  console.log(
    '--manual: (e.g. `node setup.js --manual`): Prints list of dependencies to be manually installed'
  )
  console.log(
    '--weak, --medium: (e.g. `node setup.js --weak`): Sets the password strength policy to Weak'
  )
  console.log(
    '--help: (e.g. `node setup.js --help`): Prints a list of available commands'
  )
  console.log(
    'Multiple commands can be used together (e.g. `node setup.js --verbose weak`)\n'
  )

  console.log(
    'Using the below policy definitions, select which password policy should be enforced (default Strong)'
  )
  console.log('Strong (default):')
  console.log('\tContains at least 1 lowercase alphabetical character')
  console.log('\tContains at least 1 uppercase alphabetical character')
  console.log('\tContains at least 1 numeric character')
  console.log('\tContains at least one special character: !@#\\$%^&')
  console.log('\tThe string must be at least eight characters or longer')
  console.log()

  console.log(
    'Medium (pass --medium to the arguments (e.g. `node setup.js --medium`)):'
  )
  console.log(
    '\tContains at least 1 lowercase alphabetical character and at least 1 uppercase alphabetical character; or'
  )
  console.log(
    '\tContains at least one lowercase alphabetical character and at least 1 numeric character; or'
  )
  console.log(
    '\tContains at least one uppercase alphabetical character and at least 1 numeric character'
  )
  console.log('\tThe string must be at least six characters or longer')
  console.log()

  console.log(
    'Weak (pass --weak to the arguments (e.g. `node setup.js --weak`)):'
  )
  console.log('\tNo restrictions')
  console.log()
}

// Generic function to run commands through NodeJS
// @parameter cmd: String
// @parameter msg: String
// @return promise
function runChildProcessExec (cmd, msg) {
  // Return immediately if there are no commands passed in
  if (!cmd) return

  // Print out the message passed in
  console.log(msg)

  // Return a promise once the execute command succeeds or throws
  // an error
  return new Promise((resolve, reject) => {
    // Execute the command
    cp.exec(cmd, function (error, stdout, stderr) {
      // Reject if there is an error
      if (error) {
        reject(new Error(error))
      } else {
        // Otherwise, if utilizing vebose as an option, then print
        // all statements passed back by the execute command
        if (stderr && options.verbose) console.log(stderr)
        if (stdout && options.verbose) console.log(stdout)

        // Resolve the promise
        resolve()
      }
    })
  })
}

// Creates the configuration file
// @return: promise
function createConfigFile () {
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

  // secretKey is used to generate a unique jwtToken
  // This key should be changed from it's default to a mix of
  // random characters, numbers and symbols. At least 25 characters long
  // To generate a random key, visit https://www.lastpass.com/password-generator
  const jwtSecretKey = createSecretKey()

  // The configuration that the config.json will be generated from
  const config = {
    secretKey: jwtSecretKey,
    passwordStrength: options.passwordStrength
  }

  console.log('Creating the configuration file...')

  return new Promise((resolve, reject) => {
    // Try to write a file to the config.file
    fs.writeFile(
      path.join(__dirname, '../api/config/config.json'),
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

// Setup function to pass in the commands and messages
// to the runChildProcessExec function
function setup () {
  // Check if NPM is successfully installed
  runChildProcessExec('npm -v', 'Checking if NPM is installed')
    .then(() => {
      console.log(formatOutput('NPM is installed\n', 'success'))

      // Check if Brew is installed
      return runChildProcessExec('brew -v', 'Checking if Brew is installed')
    })
    .then(() => {
      console.log(formatOutput('Brew is installed\n', 'success'))

      // Set up node_modules
      // Dependency: Node & NPM
      return runChildProcessExec('npm install', 'Setting up dependencies...')
    })
    .then(() => {
      console.log(
        formatOutput('Successfully installed node_modules\n', 'success')
      )

      // Upgrade and update brew in preparation for installing MongoDB
      // Dependency: Homebrew
      return runChildProcessExec(
        'brew update && brew upgrade',
        'Upgrading brew...'
      )
    })
    .then(() => {
      console.log(formatOutput('Successfully upgraded brew\n', 'success'))

      // Install MongoDB
      // Dependency: brew
      return runChildProcessExec(
        'brew tap mongodb/brew && brew install mongodb-community',
        'Installing MongoDB...'
      )
    })
    .then(() => {
      console.log(formatOutput('Successfully installed MongoDB\n', 'success'))

      // Install PM2
      // Dependency: NPM
      return runChildProcessExec('npm i pm2 -g', 'Installing PM2...')
    })
    .then(() => {
      console.log(formatOutput('Successfully installed PM2\n', 'success'))

      // Set up the database & adjust the user
      // Feature request: remove necessity of using sudo
      return runChildProcessExec(
        'sudo mkdir -p /data/db && sudo chown -R `id -un` /data/db',
        'Setting up database at /data/db/, pwd needed for sudo:'
      )
    })
    .then(() => {
      console.log(
        formatOutput(
          'Successfully set up the database & permissions\n',
          'success'
        )
      )

      return createConfigFile()
    })
    .then(() => {
      console.log(
        formatOutput(
          "Utilized `sudo` to set up permissions. It's recommended to set up a group for security reasons.\n",
          'warn'
        )
      )
      console.log()
      console.log('To start the processes use \x1b[32mnpm run pm2-start\x1b[0m')
      console.log('To stop the processes use  \x1b[32mnpm run pm2-stop\x1b[0m')
    })
    .catch(err =>
      console.log(
        formatOutput(
          `An error was encountered. Try manually installing the last dependency.\n${err}`,
          'error'
        )
      )
    )
}

// Format the text of a message to be outputed into a terminal (tested on MacOS iTerm2)
// @parameter msg: string
// @parameter type: string (success, warn, error)
// @return: String
function formatOutput (msg, type = 'success') {
  const RED_TEXT = '\x1b[31m'
  const GREEN_TEXT = '\x1b[32m'
  const YELLOW_TEXT = '\x1b[33m'
  const RESET_TEXT = '\x1b[0m' // Reset is required to return the text color back to normal
  const CHECK_MARK = '\u2714'
  const CROSS = '\u274c'

  switch (type) {
    case 'success':
      // String with a check mark and green text
      return `${GREEN_TEXT}${CHECK_MARK}  ${msg}${RESET_TEXT}`

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
}

// By default run the checkArgs function
checkArgs()
