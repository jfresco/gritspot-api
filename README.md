# GRITSpot API challenge

## Getting started
You'll need Node.js >= 6 and `npm`.

To start, clone this repo, `cd` to its directory and run `npm install`. All operations can be done through `npm` commands. Here's a handy guide:

* `npm start` will start the app in port 3000.
* `npm t` will run unit tests.
* `npm run lint` will check code style
* `npm run doc` will show API spec

## Contributing

### Hitchhiker's guide

This is a standard `express` application. `src/index.js` is a good place to start and follow the `require`s. Here's a guide to set what you might expect of each directory.

- `app.js` - App entry point. Mounts routes and middlewares into the `express` instance, as long as injects it real-time features.
- `routes` - Contains the routes handlers. Database access can be made here, but for complex business cases, functions from `controllers` are invoked.
- `controllers` - Contains complex business logic. Can access database.
- `db` - Database access. An API is provided to perform atomic operations. The implementation uses the Strategy pattern in order to furtherly plug other database clients without changing the API exposed to routes and controllers.

### Real-time features

Operations that makes modifications to the data are published through a WebSockets interface. Use a `socket.io` client in your frontend app in order to get instantly notified.