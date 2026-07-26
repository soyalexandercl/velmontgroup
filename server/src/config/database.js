const { Pool } = require('pg');

// Pool de conexiones a PostgreSQL, reutilizado en toda la aplicacion.
// Todas las consultas usan parametros ($1, $2...) para evitar inyeccion SQL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', error.message);
});

module.exports = pool;
