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
var uuidv5 = require('uuidv5');

var database = {
  //user1, pass1 is default username, password combo
  'user1': {hashedpass: 'd5f2054240f926d71a63249dc2c019c64a843af72554f0a4b32de0216e5f968d607c461f5744ec399acad5c149412a85b6cac0d036391b48337541e83836af25', name: 'Hambone Fakenamington', email:'ham@fakenaming.ton', }
  ,

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
      if (username in database && database[username].hashedpass == password) {
        cert.cookie = setCookieID(username);
        cert.accepted = true;
      }
      response.write(JSON.stringify(cert));
      response.end();
    }
  });
}

function setCookieID (username) {
  /*
  Generates a random number cookie for a fresh request
  In the future, could link ID to a persistent profile
  */
  /*
  Don't use uuidv5 for CSPSRG. It is only designed for unique identifiers for things like cookies. The idea here is to use the username + current time to create the id.
  Kirk 13Sep2019
  */
  var privns = uuidv5('null', username, true);
  const id = uuidv5(privns, String(Date.now()));
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

function newUser(request, response) {
  request.on('readable', () => {
    const info = JSON.parse(request.read());
    if(info) {
      const {username, ...personal} = info;
      if(!database[username]){
        const cert = { accepted: true, };
        database[username] = personal;
        cert.cookie = setCookieID(username);
        response.write(JSON.stringify(cert));
        response.end();
      }
      else {
        const cert = {accepted: false, };
        response.write(JSON.stringify(cert));
        response.end();
      }
    }
  });
}

Utils = {
  authenticate,
  setCookieID,
  getCookieID,
  usernameOf,
  authLogin,
  logout,
  newUser,
}

module.exports = Utils;
