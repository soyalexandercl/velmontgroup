// Agrega la columna message al formulario de contacto.
exports.up = (pgm) => {
  pgm.addColumn('contacts', {
    message: { type: 'text', notNull: true, default: '' },
  });

  pgm.alterColumn('contacts', 'message', { default: null });
};

exports.down = (pgm) => {
  pgm.dropColumn('contacts', 'message');
};
