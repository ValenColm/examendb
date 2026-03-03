const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DB || 'LogiTech',
  waitForConnections: true,
  connectionLimit: 10,
});

(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL conectado correctamente');
  } catch (error) {
    console.error('error conectando a mysql:', error.message);
  }
})();

module.exports = pool;