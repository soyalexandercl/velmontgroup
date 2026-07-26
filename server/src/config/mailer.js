const nodemailer = require('nodemailer');

// Transportador SMTP configurado enteramente desde variables de entorno.
// Nunca se hardcodean credenciales en el codigo fuente.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Envia la notificacion interna cuando llega un nuevo contacto desde el
// formulario del sitio. Los valores ya llegan sanitizados desde el validador.
async function sendContactNotification({ name, email, phone, locality }) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.CONTACT_EMAIL_TO,
    replyTo: email,
    subject: `Nuevo contacto desde velmontgroup.cl - ${name}`,
    text: `Nombre: ${name}\nCorreo: ${email}\nTelefono: ${phone}\nLocalidad: ${locality}`,
    html: `
      <h2>Nuevo contacto desde el sitio web</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Telefono:</strong> ${phone}</p>
      <p><strong>Localidad:</strong> ${locality}</p>
    `,
  });
}

module.exports = { sendContactNotification };
