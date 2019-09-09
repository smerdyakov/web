const database = {
  'user1': 'pass1',
  'user2': 'pass2',

  //Stores a username id unique to a particular session
  id2username: {
  },
};

function parseCookies (request) {
  const list = {}, rc = request.headers.cookie;

  rc && rc.split(';').forEach(function( cookie ) {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}

function authenticate (request) {
  const id = getCookieID(request);
  return (id in database.id2username);
}

function authLogin (request, response) {
  //Check request for username/password object
  //TODO: On logout, must erase association

  request.on('readable', () => {
    const { username, password } = JSON.parse(request.read());
    const cert = { accepted: false, };
    if (database[username] == password) {
      const id = getRandom();//setCookieID(request, response);
      database.id2username[id] = username;
      cert.accepted = true;
      cert.cookie = 'myid=' + id;
    }
    response.write(JSON.stringify(cert));
    response.end();
  });
}

function getRandom () {
  const min = 1,
        max = 100;
  const ids = database.id2username;
  const helper = () => { 
    return Math.floor(Math.random() * (max - min + 1)) + min; 
  };

  let rand = helper();
  while (rand in ids)
    rand = helper();
  return rand;
}

function setCookieID (request, response) {
  /*
  Generates a random number cookie for a fresh request
  In the future, could link ID to a persistent profile
  */
  const random = getRandom();
  const cookie = 'mychatid=' + random;
  /*
  response.writeHead(200, {
    'Set-Cookie': 'mycookie=test',
  });
  */
  return random;
}

function getCookieID (request) {
  /*
  Parses request cookies and finds the id
  cookies = parseCookies(request);
  */
  const cookies = parseCookies(request); 
  return cookies['myid'];
}

function usernameOf (id) {
  /*
  return database.query('username2id', id);
  */ 
  return database.id2username[id];
}

Utils = {
  authenticate,
  setCookieID,
  getCookieID,
  usernameOf,
  authLogin,
}

module.exports = Utils;
