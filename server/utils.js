/*
The database functions currently being used are:
database[username] (gets the password associated with the given username)
database.id2username (gets the set of id/username pairs)
database.id2username[id] (gets the username associated with the id)

The new database should implement these functions somehow

const Database = require('./newdatabase.js');
Database.query('id', username) = id;
Database.query('password', username) = password;

or something like that
*/

const database = {
  'user1': 'pass1',
  'user2': 'pass2',

  //Stores a username id unique to a particular session
  id2username: {
  },
};

function parseCookies (request) {
  //Parses cookies from request

  const list = {}, rc = request.headers.cookie;

  rc && rc.split(';').forEach(function( cookie ) {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}

function authenticate (request) {
  //Checks if request has valid key

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
      cert.cookie = setCookieID(username);
      cert.accepted = true;
    }
    response.write(JSON.stringify(cert));
    response.end();
  });
}

function getRandom () {
  /*Placeholder for a real random number generator*/
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

function setCookieID (username) {
  /*
  Generates a random number cookie for a fresh request
  In the future, could link ID to a persistent profile
  */
  const id = getRandom();
  database.id2username[id] = username;
  return 'myid=' + id;
}

function getCookieID (request) {
  /*
  Parses request cookies and finds the id
  */
  const cookies = parseCookies(request); 
  return cookies['myid'];
}

function usernameOf (id) {
  /*
  return database.query('username', id);
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
