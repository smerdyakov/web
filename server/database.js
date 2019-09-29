const mysql = require('mysql');
const execsql = require('execsql');
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'site_backend'
}

function userExists(username) {
//Checks whether a user exists.
  var sql =
    'SELECT EXISTS (' +
      'SELECT 1 ' +
      'FROM tbl_users ' +
      'WHERE Username = ?' +
    ') AS User_Found;';
  var con = mysql.createConnection(dbConfig);
  var record;

  return new Promise(function(resolve, reject) {
    con.query(sql, username, function(err, results) {
      if (err) return reject(err);
      record = results[0];
      resolve(Boolean(record['User_Found']));
    });
  });
}

function insertUser(username, hashedPass, name, email) {
//Adds a user to the database.
  var sql =
    'INSERT INTO tbl_users (Username, Hashed_Password, Name, Email) ' +
    'VALUES (?, ?, ?, ?);';
  var con = mysql.createConnection(dbConfig);

  return new Promise(function(resolve, reject) {
    con.query(sql, [username, hashedPass, name, email], function(err, results, fields) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function getHashedPassword(username) {
//Given a username, returns the associated password.
  var sql =
    'SELECT Hashed_Password ' +
    'FROM tbl_users ' +
    'WHERE Username = ?;';
  var con = mysql.createConnection(dbConfig);
  var record;
  var hashedPass;

  return new Promise(function(resolve, reject) {
    con.query(sql, username, function(err, results) {
      if (err) return reject(err);
      record = results[0];
      if (record) hashedPass = record['Hashed_Password'];
      resolve(hashedPass);
    });
  });
}

function chatroomExists(chatroomID) {
//Checks whether a chatroom exists.
  var sql =
    'SELECT EXISTS (' +
      'SELECT 1 ' +
      'FROM tbl_chatrooms ' +
      'WHERE Chatroom = ?' +
    ') AS Chatroom_Found;';
  var con = mysql.createConnection(dbConfig);
  var record;

  return new Promise(function(resolve, reject) {
    con.query(sql, chatroomID, function(err, results) {
      if (err) return reject(err);
      record = results[0];
      resolve(Boolean(record['Chatroom_Found']));
    });
  });
}

function insertChatroom(chatroomID) {
//Adds a chatroom to the database.
  var sql =
    'INSERT IGNORE INTO tbl_chatrooms (Chatroom) ' +
    'VALUES (?);';
  var con = mysql.createConnection(dbConfig);

  return new Promise(function(resolve, reject) {
    con.query(sql, chatroomID, function(err, results, fields) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function getInternalChatroomID(chatroomID) {
//Given a chatroom ID, returns the database's internal ID for that chatroom.
  var sql =
    'SELECT Chatroom_ID ' +
    'FROM tbl_chatrooms ' +
    'WHERE Chatroom = ?;';
  var con = mysql.createConnection(dbConfig);
  var record;
  var internalID;

  return new Promise(function(resolve, reject) {
    con.query(sql, chatroomID, function(err, results) {
      if (err) return reject(err);
      record = results[0];
      if (record) internalID = record['Chatroom_ID'];
      resolve(internalID);
    });
  });
}

function insertMessage(internalChatroomID, message) {
//Adds a message (and its associated chatroom, specified by internal ID) to the database.
  var sql =
    'INSERT INTO tbl_messages (Chatroom_ID, Message) ' +
    'VALUES (?, ?);';
  var con = mysql.createConnection(dbConfig);

  return new Promise(function(resolve, reject) {
    con.query(sql, [internalChatroomID, JSON.stringify(message)], function(err, results, fields) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function getChatroomMessages(internalChatroomID) {
//Returns the messages associated with a chatroom.
  var sql =
    'SELECT Message ' +
    'FROM tbl_messages ' +
    'WHERE Chatroom_ID = ?;';
  var con = mysql.createConnection(dbConfig);
  var internalID;

  return new Promise(function(resolve, reject) {
    con.query(sql, internalChatroomID, function(err, results) {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

Database = {
  userExists,
  insertUser,
  getHashedPassword,
  chatroomExists,
  insertChatroom,
  getInternalChatroomID,
  insertMessage,
  getChatroomMessages,
}

module.exports = Database;
