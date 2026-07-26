// Crea la tabla contacts para el formulario del sitio, con indices sobre
// created_at (listados recientes) y email (busqueda/deduplicacion).
exports.up = (pgm) => {
  pgm.createTable('contacts', {
    id: 'id',
    name: { type: 'varchar(150)', notNull: true },
    email: { type: 'varchar(255)', notNull: true },
    phone: { type: 'varchar(30)', notNull: true },
    locality: { type: 'varchar(150)', notNull: true },
    ip_address: { type: 'varchar(45)', notNull: true },
    user_agent: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('contacts', 'created_at');
  pgm.createIndex('contacts', 'email');
};

exports.down = (pgm) => {
  pgm.dropTable('contacts');
};
