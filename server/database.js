const mysql = require('mysql');
const execsql = require('execsql');
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'site_backend'
}

function rebuild() {
// Builds the database using db_script.sql.
  var execsql = require('execsql');
  var dbConfigInitial = {
    host: 'localhost',
    user: 'root',
    password: ''
  };
  var sqlFile = __dirname + '/db_script.sql';

  execsql.config(dbConfigInitial)
    .execFile(sqlFile, function(err, results){
      if (err) throw err;
      console.log('Database rebuilt.');
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

Database = {
  rebuild,
  insertUser,
  getHashedPassword,
}

module.exports = Database;
