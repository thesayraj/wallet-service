const mysql = require("mysql2/promise");
const { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT } = require("../config");

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 15,

  // Important to handle 64 bit numbers properly
  supportBigNumbers: true,
  bigNumberStrings: true,
});

module.exports = pool;
