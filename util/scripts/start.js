/*
  # Check to see if the configuration already exists. If so, verify it has the required fields:
  # - Password strength
  # - secretKey
  # - OS Type (mac, linux, windows)

  # If the configuration file does not exist, create it. If the fields are incorrect, recreate the file

  Check if PM2 services are running: app, database. If so, kill them
  START MongoDB PM2 service
  npm install
  npm run build
  NODE_ENV=production node server
  react-scripts start

  listen if port 3000 is killed. If so, then stop the PM2 services
*/
