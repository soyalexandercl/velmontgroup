const express = require('express');

const { registerContact } = require('./contact.service');
const { issueCsrfToken, verifyCsrfToken } = require('../middleware/csrf');
const { contactRateLimiter } = require('../middleware/security');

const router = express.Router();

// Entrega un token CSRF nuevo para que el frontend lo use al enviar el formulario.
router.get('/csrf-token', (req, res) => {
  const token = issueCsrfToken(req, res);
  res.json({ csrfToken: token });
});

// Recibe el formulario de contacto: valida, guarda en base de datos y notifica por correo.
router.post('/contact', contactRateLimiter, verifyCsrfToken, async (req, res, next) => {
  try {
    const requestMeta = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || '',
    };

    await registerContact(req.body, requestMeta);
    res.status(201).json({ message: 'Mensaje recibido correctamente.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
