const validator = require('validator');

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]{2,150}$/;
const PHONE_REGEX = /^\+?\d{8,15}$/;

// Valida y sanitiza los datos del formulario de contacto.
// Devuelve los valores ya escapados (a prueba de XSS) junto con los errores
// encontrados, si los hay.
function validateContact(input = {}) {
  const errors = {};

  const name = validator.trim(String(input.name || ''));
  const email = validator.trim(String(input.email || ''));
  const phone = validator.trim(String(input.phone || '')).replace(/[\s-]/g, '');
  const locality = validator.trim(String(input.locality || ''));
  const message = validator.trim(String(input.message || ''));

  if (!NAME_REGEX.test(name)) {
    errors.name = 'Ingresa un nombre valido (solo letras, 2 a 150 caracteres).';
  }

  if (!validator.isEmail(email)) {
    errors.email = 'Ingresa un correo electronico valido.';
  }

  if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Ingresa un telefono valido (8 a 15 digitos).';
  }

  if (locality.length < 2 || locality.length > 150) {
    errors.locality = 'Ingresa una localidad valida (2 a 150 caracteres).';
  }

  if (message.length < 10 || message.length > 2000) {
    errors.message = 'Ingresa un mensaje valido (10 a 2000 caracteres).';
  }

  const data = {
    name: validator.escape(name),
    email: validator.normalizeEmail(email) || validator.escape(email),
    phone: validator.escape(phone),
    locality: validator.escape(locality),
    message: validator.escape(message),
  };

  return { isValid: Object.keys(errors).length === 0, errors, data };
}

module.exports = { validateContact };
