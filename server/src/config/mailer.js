// Envia la notificacion de contacto a traves de FormSubmit (formsubmit.co),
// que entrega el mensaje a CONTACT_EMAIL_TO sin necesitar credenciales SMTP.
// La primera vez, FormSubmit envia un correo de activacion a ese buzon que hay
// que confirmar una sola vez. Los valores ya llegan sanitizados desde el validador.
async function sendContactNotification({ name, email, phone, locality, message }) {
  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(process.env.CONTACT_EMAIL_TO)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `Nuevo contacto desde velmontgroup.cl - ${name}`,
        _template: 'table',
        _captcha: 'false',
        _replyto: email,
        Nombre: name,
        Correo: email,
        Telefono: phone,
        Localidad: locality,
        Mensaje: message,
      }),
    },
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === 'false' || result.success === false) {
    throw new Error(`FormSubmit rechazo el envio: ${result.message || response.status}`);
  }
}

module.exports = { sendContactNotification };
