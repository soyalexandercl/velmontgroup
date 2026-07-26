const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Cabeceras de seguridad HTTP. CSP restrictiva: el sitio no carga scripts,
// estilos ni recursos de dominios externos.
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
});

// Limita los envios del formulario de contacto por IP para evitar spam/abuso.
const contactRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta nuevamente mas tarde.' },
});

module.exports = { securityHeaders, contactRateLimiter };
