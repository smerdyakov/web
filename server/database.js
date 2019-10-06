const mysql = require('mysql');
const execsql = require('execsql');
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'site_backend'
}
var con = mysql.createConnection(dbConfig);

/* 'query' wraps mysql's connection.query function. Accepts a query string,
one or more query arguments (which will be safely escaped), and an
'extractor' function that specifies what part of connection.query's
callback results to return in a fulfilled promise.

TO DO:
  1. Make the extractor argument optional, defaulting to the identity function.
  2. Make the query arguments optional. */

function query(sql, args, extractor) {
  return new Promise((resolve, reject) => {
    con.query(sql, args, (err, results) => {
      if (err) return reject(err);
      resolve(extractor(results));
    });
  });
}

function userExists(username) {
//Checks whether a user exists.
  var sql =
    'SELECT EXISTS (' +
      'SELECT 1 ' +
      'FROM tbl_users ' +
      'WHERE Username = ?' +
    ') AS User_Found;';

  return query(sql, username, rows => Boolean(rows[0]['User_Found']));
}

function insertUser(username, hashedPass, name, email) {
//Adds a user to the database.
  var sql =
    'INSERT INTO tbl_users (Username, Hashed_Password, Name, Email) ' +
    'VALUES (?, ?, ?, ?);';

  return query(sql, [username, hashedPass, name, email], x => x);
}

function getHashedPassword(username) {
//Given a username, returns the associated password.
  var sql =
    'SELECT Hashed_Password ' +
    'FROM tbl_users ' +
    'WHERE Username = ?;';

  return query(sql, username, rows =>
    rows[0] ? rows[0]['Hashed_Password'] : undefined);
}

function chatroomExists(chatroomID) {
//Checks whether a chatroom exists.
  var sql =
    'SELECT EXISTS (' +
      'SELECT 1 ' +
      'FROM tbl_chatrooms ' +
      'WHERE Chatroom = ?' +
    ') AS Chatroom_Found;';

  return query(sql, chatroomID, rows => Boolean(rows[0]['Chatroom_Found']));
}

function insertChatroom(chatroomID) {
//Adds a chatroom to the database.
  var sql =
    'INSERT IGNORE INTO tbl_chatrooms (Chatroom) ' +
    'VALUES (?);';

  return query(sql, chatroomID, x => x);
}

function getInternalChatroomID(chatroomID) {
//Given a chatroom ID, returns the database's internal ID for that chatroom.
  var sql =
    'SELECT Chatroom_ID ' +
    'FROM tbl_chatrooms ' +
    'WHERE Chatroom = ?;';

  return query(sql, chatroomID, rows =>
    rows[0] ? rows[0]['Chatroom_ID'] : undefined);
}

function insertMessage(internalChatroomID, message) {
//Adds a message (and its associated chatroom, specified by internal ID) to the database.
  var sql =
    'INSERT INTO tbl_messages (Chatroom_ID, Message) ' +
    'VALUES (?, ?);';

  return query(sql, [internalChatroomID, JSON.stringify(message)], x => x);
}

function getChatroomMessages(internalChatroomID) {
//Returns the messages associated with a chatroom.
  var sql =
    'SELECT Message ' +
    'FROM tbl_messages ' +
    'WHERE Chatroom_ID = ?;';

  return query(sql, internalChatroomID, x => x);
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
