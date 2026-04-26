const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  socketPath: '/tmp/mysql.sock',   // ✅ FIX (use socket instead of port)
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err);
  });

module.exports = pool;