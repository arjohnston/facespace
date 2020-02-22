module.exports = {
  apps: [
    {
      name: 'api',
      script: './server.js',
      watch: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
