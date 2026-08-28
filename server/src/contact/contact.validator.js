const validator = require('validator');

// Sanitiza los datos del formulario de contacto (a prueba de XSS) sin
// aplicar restricciones de formato ni longitud.
function validateContact(input = {}) {
  const name = validator.trim(String(input.name ?? ''));
  const email = validator.trim(String(input.email ?? ''));
  const phone = validator.trim(String(input.phone ?? ''));
  const locality = validator.trim(String(input.locality ?? ''));
  const message = validator.trim(String(input.message ?? ''));

  const data = {
    name: validator.escape(name),
    email: validator.escape(email),
    phone: validator.escape(phone),
    locality: validator.escape(locality),
    message: validator.escape(message),
  };

  return { isValid: true, errors: {}, data };
}

module.exports = { validateContact };
