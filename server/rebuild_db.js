/* Builds the database using db_script.sql. */

const execsql = require('execsql');
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
