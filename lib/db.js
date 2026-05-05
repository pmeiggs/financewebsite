// lib/db.js
import mysql from 'mysql2/promise';

// create connection pool using env vars set in .env.local
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'finance_tracker',
  waitForConnections: true,
  connectionLimit:    10,
  multipleStatements: false, // prevents stacked sql injection attacks
});

export default pool;
