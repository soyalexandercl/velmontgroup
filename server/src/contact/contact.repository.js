const pool = require('../config/database');

// Inserta un nuevo contacto y devuelve su id y fecha de creacion.
// Usa parametros ($1..$6) para evitar inyeccion SQL.
async function insertContact({ name, email, phone, locality, ipAddress, userAgent }) {
  const query = `
    INSERT INTO contacts (name, email, phone, locality, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, created_at
  `;
  const values = [name, email, phone, locality, ipAddress, userAgent];

  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = { insertContact };
