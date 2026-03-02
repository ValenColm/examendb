// Importa la librería 'mysql2' con soporte para promesas ('/promise'), permitiendo usar async/await.
const mysql = require('mysql2/promise');

// Crea un "pool" de conexiones con las configuraciones necesarias.
const pool = mysql.createPool({
  // Host de la base de datos (normalmente 'localhost' si está en la misma máquina).
  host: process.env.MYSQL_HOST || 'localhost',
  // Usuario de MySQL.
  user: process.env.MYSQL_USER || 'root',
  // Contraseña del usuario.
  password: process.env.MYSQL_PASSWORD || '1234',
  // Nombre de la base de datos a utilizar.
  database: process.env.MYSQL_DB || 'SaludPlus',
  // Si no hay conexiones disponibles, espera a que se libere una.
  waitForConnections: true,
  // Límite máximo de conexiones simultáneas en el pool.
  connectionLimit: 10,
});

// Llama inmediatamente a una función anónima autoejecutada (IIFE) asíncrona para probar la conexión.
(async () => {
  try {
    // Ejecuta una consulta simple 'SELECT 1' solo para verificar si la conexión funciona.
    await pool.query('SELECT 1');
    // Si la consulta funciona, imprime este mensaje.
    console.log('MySQL conectado correctamente');
  } catch (error) {
    // Si hay un error, imprime el mensaje de error.
    console.error('error conectando a mysql:', error.message);
  }
})();

// Exporta el pool de conexiones para poder realizar consultas en otros archivos (routes, etc.).
module.exports = pool;