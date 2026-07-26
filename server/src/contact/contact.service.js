const { validateContact } = require('./contact.validator');
const { insertContact } = require('./contact.repository');
const { sendContactNotification } = require('../config/mailer');

// Orquesta el registro de un nuevo contacto: valida, guarda en base de datos
// y notifica por correo. Si el correo falla, el contacto ya quedo guardado
// (el error de envio se registra pero no se propaga al usuario).
async function registerContact(input, requestMeta) {
  const { isValid, errors, data } = validateContact(input);

  if (!isValid) {
    const error = new Error('Datos de contacto invalidos.');
    error.status = 400;
    error.details = errors;
    throw error;
  }

  const saved = await insertContact({
    ...data,
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
  });

  try {
    await sendContactNotification(data);
  } catch (error) {
    console.error('Error enviando notificacion de contacto:', error.message);
  }

  return saved;
}

module.exports = { registerContact };
