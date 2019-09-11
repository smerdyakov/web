const WebSocket = require('ws'),
      http = require('http'),
      path = require('path'),
      fs = require('fs');

const Chat = require('./chat.js');
const Utils = require('./utils.js');

const PUBLIC_DIR = path.join(__dirname, '../public/');

const serverUrl = 'localhost';
const port = 3000;

/* setup http and websocket servers */

wsserver = new WebSocket.Server({ noServer: true });

const server = http.createServer((request, response) => {
  logRequest(request);
  const url = sanitize(request.url);
  let policy = url in policies ? policies[url] : policies['default'];
  policy(request, response);
});

console.log('Server @ ' + serverUrl + ': ' + port);
server.listen(port, serverUrl);

/* connecting websocket to server */

server.on('upgrade', (request, wsocket, head) => {
  if (!Utils.authenticate(request)){
    wsocket.destroy();
    return;
  }

  wsserver.handleUpgrade(request, wsocket, head, (ws) => {
    wsserver.emit('connection', ws, request);
  });
});

const clients = new Chat.Chatroom();
wsserver.on('connection', (wsocket, request) => {
  const client = new Chat.Client(wsocket, request);
  clients.add(client);

  wsocket.on('message', (message) => {
    message = JSON.parse(message);
    client.broadcast(message);
  });
});

/* server helper funcitons */

const logRequest = (request) => {
  console.log('Request from: ' + request.url);
}

const sendFile = (filepath, response) => {
  fs.readFile(filepath, 'binary', (err, file) => {
    if (err)
      throw err;
    response.write(file, 'binary');
    response.end();
  });
};

const serveFile = (request, response) => {
  const filepath = path.join(PUBLIC_DIR, sanitize(request.url));
  console.log('Serving file: ' + filepath);
  sendFile(filepath, response);
}

const sanitize = url => {
  //TODO: sanitize to avoid vulnerability
  return url;
}

const authThen = policy => {
  const authorizedPolicy = (request, response) => {
    if (Utils.authenticate(request)) {
      policy(request, response);
    }
    else
      policies['default'](request, response);
  }
  return authorizedPolicy;
}

/* server policies */
//TODO: login.html should redirect to home if auth is possible

let policies = {
  '/index.html': authThen(serveFile),
  '/index.js'  : authThen(serveFile),
  '/utils_public.js' : authThen(serveFile),

  '/login.html': serveFile,
  '/login.js'  : serveFile,
  '/login/auth': Utils.authLogin,
  '/logout'    : Utils.logout,

  '/login/newuser' : Utils.newUser,

  '/styles/PlayfairDisplay-Regular.ttf': serveFile,
  '/styles/PlayfairDisplay-Bold.ttf'   : serveFile,
  '/styles/Merriweather-Regular.ttf'   : serveFile,
  '/styles/Merriweather-Bold.ttf'      : serveFile,
  '/styles/Modak-Regular.ttf'          : serveFile,
  '/styles/PTMono-Regular.ttf'         : serveFile,
  '/styles/home_styles.css'            : serveFile,
  '/styles/login_styles.css'           : serveFile,

  'default'    : (request, response) => {
    const filename = path.join(PUBLIC_DIR, '/login.html');
    sendFile(filename, response);
  }
};
