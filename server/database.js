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

function setSessionID(username, id) {
//Sets the session ID for a user.
  var sql =
    'UPDATE tbl_users ' +
    'SET Session_ID = ? ' +
    'WHERE Username = ?;';
  var con = mysql.createConnection(dbConfig);

  return new Promise(function(resolve, reject) {
    con.query(sql, [id, username], function(err, results) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function sessionIDExists(id) {
//Checks whether a session ID exists.
  var sql =
    'SELECT EXISTS (' +
      'SELECT 1 ' +
      'FROM tbl_users ' +
      'WHERE Session_ID = ?' +
    ') AS Session_ID_Found;';
  var con = mysql.createConnection(dbConfig);
  var record;

  if (!id) id = '';
  return new Promise(function(resolve, reject) {
    con.query(sql, id, function(err, results) {
      if (err) return reject(err);
      record = results[0];
      resolve(Boolean(record['Session_ID_Found']));
    });
  });
}

function getUsernameOfSessionID(id) {
//Given a session ID, returns the associated username.
  var sql =
    'SELECT Username ' +
    'FROM tbl_users ' +
    'WHERE Session_ID = ?;';
  var con = mysql.createConnection(dbConfig);
  var record;
  var username;

  return new Promise(function(resolve, reject) {
    con.query(sql, id, function(err, results) {
      if (err) return reject(err);
      record = results[0];
      if (record) username = record['Username'];
      resolve(username);
    });
  });
}

function deleteSessionID(id) {
//Deletes a session ID.
  var sql =
    'UPDATE tbl_users ' +
    'SET Session_ID = Null ' +
    'WHERE Session_ID = ?;';
  var con = mysql.createConnection(dbConfig);

  return new Promise(function(resolve, reject) {
    con.query(sql, id, function(err, results) {
      if (err) return reject(err);
      resolve();
    });
  });
}

sessionIDExists(undefined).then((found) => {
  console.log(found);
});

Database = {
  userExists,
  insertUser,
  getHashedPassword,
  setSessionID,
  sessionIDExists,
  getUsernameOfSessionID,
  deleteSessionID,
}

module.exports = Database;
