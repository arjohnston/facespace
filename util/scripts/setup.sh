#!/bin/bash

# Check to see if we have required dependencies. If not, install them:
# - Node JS
# - NPM
# - PM2
# - MongoDB
# - Git CLI

# Configure MongoDB
# - Create a DB file, set up permissions if needed

install_brew () {
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  brew doctor
  brew upgrade && brew update
}
install_node () {
  brew install node
}
install_pm2 () {
  npm i -g pm2
}
install_mongo () {
  brew tap mongodb/brew
  brew install mongodb-community

  sudo mkdir -p /Volumes/data/db/
  sudo chown -R `id -un` /Volumes/data/db/
}
install_git () {
  brew install git
}

install_brew
install_node
install_pm2
install_mongo
install_git
