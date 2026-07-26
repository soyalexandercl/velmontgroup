const crypto = require('crypto');

const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Genera un token CSRF y lo entrega en una cookie (patron double-submit):
// el frontend debe reenviar ese mismo valor en el header x-csrf-token.
// La cookie no es httpOnly a proposito, porque el JS del cliente necesita leerla.
function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000,
  });

  return token;
}

// Verifica que el token del header coincida con el de la cookie antes de
// aceptar una mutacion (POST). Usa comparacion en tiempo constante.
function verifyCsrfToken(req, res, next) {
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  const isValid =
    Boolean(cookieToken) &&
    Boolean(headerToken) &&
    cookieToken.length === headerToken.length &&
    crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));

  if (!isValid) {
    return res.status(403).json({ error: 'Token CSRF invalido o ausente.' });
  }

  next();
}

module.exports = { issueCsrfToken, verifyCsrfToken };
