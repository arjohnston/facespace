## Table of Contents
- [Setup and Dependencies](#setup-and-dependencies)
- [Available Scripts](#available-scripts)

---

## Setup and Dependencies
This project was built in the Ubuntu Xenial 16.04 LTS Linux environment, and was built on
- Node.js v8.9.1+
- ExpressJS NPM package v4.16.2+
- MongoDB Official Driver NPM package v2.2.33+

#### Automatic Install [MacOS, Linux]
  1. Navigate to the util/scripts folder
    - `cd util/scripts`
  2. Run the setup script
    - `chmod +x setup.sh && bash setup.sh`

#### Manual Install [Windows, MacOS, Linux]
  1. In a _"main"_ directory of your choice (i.e. `cd` into `Desktop` or `Documents`), you can acquire the latest **Node.js** package in two ways:
      - **Download** from *nodejs.org*, or
      - **Install** through the command line using `apt-get` (or whatever package manager is supported by your OS, i.e. `yum`)
      - Verify the installation succeeded using `node -v` on command line. You should see the version of your package printed out (e.g. `v10.14.2`).
  2. [MacOS, Linux] Install Homebrew (e.g. `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`)
      - After installing, upgrade existing packages by running the command: `brew upgrade && brew update`
  3. Acquire MongoDB in the main directory as well (locally on your machine).
      - MacOS, Linux:
        - Use Homebrew to install MongoDB:
          - `brew tap mongodb/brew`
          - `brew install mongodb-community`
      - Windows:
        - Download and install the package from the [MongoDB website](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
        - Follow your OS's installation instructions listed on the [MongoDB website](https://www.mongodb.com/)
  4. After installing MongoDB, initialize your database document store by creating the `/data/db` directory
      - MacOS, Linux:
        - `sudo mkdir -p /Volumes/data/db` _(Use `sudo` in front of `mkdir` if necessary)_
        - ``sudo chown -R `id -un` /Volumes/data/db`` _(Use `sudo` in front of `chown` if necessary)_
      - Windows:
        - `cd C:\`
        - `md "\data\db"`
  5. [Windows] Install git by downloading it [here](https://git-scm.com/download/win)
  6. [Windows] Install PM2
      - `npm i -g pm2`
  7. If you haven't already cloned the project on your local machine, clone the `dev` branch into a location of your choice (e.g. the `Documents` directory):
      - `git clone https://github.com/arjohnston/myface`
  8. Go to the root directory of the project (i.e. `cd /path/to/your/.../myface/`
  9. Create your own branch to work off of:
      - `git checkout -b [name]`
  10. [Windows] In a new terminal window, run the mongo daemon by entering:
      - `"C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="c:\data\db"`
  11. Run the app in the root project directory using: `npm start`
      - MacOS, Linux:
        - `npm start`
      - Windows:
        -  `node util/scripts/start.js`
      - The app should automatically run on port 3000 and 8080 and open in your default browser

## Available Scripts

In the project directory, you can run:

Build and run:
```sh
npm run start
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
