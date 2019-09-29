/*
The database functions currently being used are:
Database.getHashedPassword(username) (gets the password associated with the given username)
localDatabase.id2username (gets the set of id/username pairs)
localDatabase.id2username[id] (gets the username associated with the id)

The new database should implement these functions somehow

const Database = require('./database.js');
Database.query('id', username) = id;
Database.query('password', username) = password;

or something like that
*/

const uuidv5 = require('uuidv5'),
      bcrypt = require('bcrypt'),
      blake = require('blakejs'),
      Database = require('./database.js');

/* database + database functions */

const localDatabase = {
  //Stores an id, username pair unique to a particular session
  id2username: {
  },
};

function usernameOf(id) {
  return localDatabase.id2username[id];
}

function logMessage(chatroomID, message) {
  Database.insertChatroom(chatroomID).then( (inserted) => {
    Database.getInternalChatroomID(chatroomID).then( (internalID) => {
      Database.insertMessage(internalID, message).then( (results) => {
        console.log('Message logged.')
      });
    });
  });
}

function loggedMessages(chatroomID) {
  return new Promise( (resolve, reject) => {
    Database.getInternalChatroomID(chatroomID).then( (internalID) => {
      Database.getChatroomMessages(internalID).then( (messages) => {
        resolve(messages);
      });
    });
  });
}

/* cookie handling + auxiliary functions */

function parseCookies (request) {
  //Parses cookies from request
  const list = {}, rc = request.headers.cookie;

  rc && rc.split(';').forEach(function( cookie ) {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}

function setCookieID (username) {
  /*
  Generates a random number cookie for a fresh request
  In the future, could link ID to a persistent profile

  Don't use uuidv5 for CSPRNG (crypto secure pseudo random num gen). It is only designed for unique identifiers for things like cookies. The idea here is to use the username + current time to create the id.
  Kirk 13Sep2019
  */
  var privns = uuidv5('null', username, true);
  const id = uuidv5(privns, String(Date.now()));
  localDatabase.id2username[id] = username;
  return 'myid=' + id;
}

function getCookieID (request) {
  const cookies = parseCookies(request);
  return cookies['myid'];
}

function sendCert(response, accepted, cookie) {
  const cert = { accepted, cookie, };
  response.write(JSON.stringify(cert));
  response.end();
}

/* main routines */

function authenticate (request) {
  //Check if request has valid cookie
  const id = getCookieID(request);
  return (id in localDatabase.id2username);
}

function authorizeLogin (request, response) {
  //Check request for username/password object
  request.on('readable', () => {
    const info = JSON.parse(request.read());
    //When request stream closes, it sends a null request - do nothing at close
    if (!info) return;

    Database.userExists(info.username).then( (userFound) => {
      if (!userFound)
        sendCert(response, false, null);
      else {
        const {username, password} = info;
        Database.getHashedPassword(username).then( (hashedPass) => {
          bcrypt.compare(password, hashedPass, (err, match) => {
            if (err) throw err;
            sendCert(response, match, match ? setCookieID(username) : null)
          });
        })
      }
    });
  });
}

function logout (request, response) {
  request.on('readable', () => {
    const cookies = parseCookies(request);
    const id = cookies['myid'];

    if (id in localDatabase.id2username)
      delete localDatabase.id2username[id];

    response.write('Logout successful');
    response.end();
  });
}

function newUser(request, response) {
  request.on('readable', () => {
    const info = JSON.parse(request.read());
    if(info) {
      const {username, ...personal} = info;
      Database.userExists(username).then( (userFound) => {
        if(!userFound){
          //hashCost is a parameter that controls the hash speed
          //higher hashCost => slower hash => more secure
          const hashCost = 10;
          //bcrypt automatically uses a random salt and prepends it to hash
          bcrypt.hash(personal.hashedpass, hashCost, (err, hash) => {
            Database.insertUser(username, hash, personal.name, personal.email)
              .then( (inserted) => {
                sendCert(response, true, setCookieID(username));
              });
          });
        }
        else
          sendCert(response, false, null);
      });
    }
  });
}

Utils = {
  logMessage,
  loggedMessages,
  authenticate,
  setCookieID,
  getCookieID,
  usernameOf,
  authorizeLogin,
  logout,
  newUser,
}

module.exports = Utils;
