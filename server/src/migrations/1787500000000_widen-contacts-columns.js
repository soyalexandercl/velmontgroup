// Quita los limites de longitud de los campos del formulario de contacto:
// pasan de varchar(N) a text para aceptar cualquier longitud.
exports.up = (pgm) => {
  pgm.alterColumn('contacts', 'name', { type: 'text' });
  pgm.alterColumn('contacts', 'email', { type: 'text' });
  pgm.alterColumn('contacts', 'phone', { type: 'text' });
  pgm.alterColumn('contacts', 'locality', { type: 'text' });
};

exports.down = (pgm) => {
  pgm.alterColumn('contacts', 'name', { type: 'varchar(150)' });
  pgm.alterColumn('contacts', 'email', { type: 'varchar(255)' });
  pgm.alterColumn('contacts', 'phone', { type: 'varchar(30)' });
  pgm.alterColumn('contacts', 'locality', { type: 'varchar(150)' });
};
