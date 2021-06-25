var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const connection = require("./connection/connect");
var http = require('http');
var debug = require('debug')('mmnt:server');
let Response = require('./utility/response')
const helmet = require("helmet");

const { io } = require('./socket/user');



var v1Routes = require('./v1/routes')

var app = express();

app.use(logger('dev'));
app.set('trust proxy', 'loopback') 
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/user/profile/image', express.static(__dirname + "/public/images/users"));
app.use('/api/v1/', v1Routes);

app.use((req, res, next) => {
  const err = "Oops! Page Not Found";
  res.status(404).send({ status: 404, message: err });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 400;
  if (err.message == "jwt expired") { res.status(401).send({ status: 401, message: err }) }
  if (typeof err == typeof "") { Response.sendFailResponse(req, res, status, err) }
  else if(err.Error)  res.status(status).send({ status: status, message: err.Error });
  else if(err.message) res.status(status).send({ status: status, message: err.message });
  else res.status(status).send({ status: status, message: err.message });
});

var port = normalizePort(process.env.PORT || '1406');
app.set('port', port);

var server = http.createServer(app);
io.attach(server);


server.listen(port,async () => {
    console.log(`Node env :${process.env.NODE_ENV}.`);
    console.log(`Running on port: ${port}.`);
    await connection.mongoDbconnection();

  });
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
