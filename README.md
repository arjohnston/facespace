This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Overview
This project is a boilerplate using the MERN stack to create a simple web app with an authentication layer.

<p align='center'>
  <img src='https://github.com/arjohnston/boilerplates/blob/master/mern-auth/public/example.png' width='600' alt='start up'>
</p>

## Installation

### Mern-auth Boilerplate

Clone the repository:
```sh
git clone https://github.com/arjohnston/boilerplates.git
```

### Install and setup the project

By default, a strong password policy will be used, to change it use `--medium` or `--weak` appended to the command below for `node setup.js`
```sh
cd /util/
node setup.js
```

For help with additional commands, use:
```sh
node setup.js --help
```

### Manual installation of dependencies

Use the following command to print out a list of all dependencies as well as build the configuration file
```sh
node setup.js --manual
```

## Available Scripts

In the project directory, you can run:

Launch the daemons for the database and API server:
```sh
npm run pm2-start
```

Stop the daemons created by PM2:
```sh
npm run pm2-stop
```

Launch the test runner utilizing mocha and chai:
```sh
npm test
```

Run a script to get the latest changes from github, installs any new dependencies and spawns the daemons:
```sh
npm run deploy
```

Run a linter against the repository to standardize the format of the code:
```sh
npm run lint
```


## Other available scripts

```sh
npm run dev
```

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

> Note: In order to use API's while in development mode, the express server needs to be run in a separate terminal

```sh
npm run start
```

Runs the app in production mode.<br>
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

The app needs to be re-built if you make edits<br>

```sh
npm run build
```

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
