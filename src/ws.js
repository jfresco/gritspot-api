module.exports = function (app) {
  const server = require('http').Server(app)
  const io = require('socket.io')(server)

  // Make `socket.io` instance available on all middlewares
  app.use((req, res, next) => {
    req.io = io
    next()
  })

  return server
}
