// Maneja cualquier error no capturado en las rutas de forma centralizada.
// Nunca expone stack traces ni detalles internos al cliente.
function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const response = { error: error.message || 'Error interno del servidor.' };

  if (error.details) {
    response.details = error.details;
  }

  if (status >= 500) {
    console.error('Error no controlado:', error);
  }

  res.status(status).json(response);
}

module.exports = { errorHandler };
