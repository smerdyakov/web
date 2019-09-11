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
    const info = JSON.parse(request.read());
    //Added if statement to make sure the request is not null.
    //We were having an issue with two requests being sent. Kirk 09Sep2019
    if(info) {
      const {username, password} = info;
      const cert = { accepted: false, };

      if (database[username] == password) {
        cert.cookie = setCookieID(username);
        cert.accepted = true;
      }
      response.write(JSON.stringify(cert));
      response.end();
    }
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

function logout (request, response) {
  request.on('readable', () => {
    const cookies = parseCookies(request);
    const id = cookies['myid'];
    const user = database.id2username[id];

    if (id in database.id2username)
      delete database.id2username[id];

    console.log('Logged out ' + user);
    response.write('Logout successful');
    response.end();
  });
}

Utils = {
  authenticate,
  setCookieID,
  getCookieID,
  usernameOf,
  authLogin,
  logout,
}

module.exports = Utils;
