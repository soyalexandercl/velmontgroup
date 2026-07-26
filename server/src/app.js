const path = require('path');

const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const contactRoutes = require('./contact/contact.routes');
const { securityHeaders } = require('./middleware/security');
const { errorHandler } = require('./middleware/error-handler');

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');

// Construye y configura la aplicacion Express: seguridad, estaticos, API y
// manejo de errores. No contiene logica de arranque (eso vive en server.js).
function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(securityHeaders);
  app.use(compression());
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.use(express.static(PUBLIC_DIR, { maxAge: '30d', etag: true }));

  app.use('/api', contactRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
