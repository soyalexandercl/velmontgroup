require('dotenv').config();

const REQUIRED_VARS = [
  'DATABASE_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'CONTACT_EMAIL_TO',
];

// Valida que existan las variables de entorno criticas antes de arrancar el
// servidor. Falla rapido y explicito en vez de romper mas tarde en produccion.
function validateEnv() {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };
