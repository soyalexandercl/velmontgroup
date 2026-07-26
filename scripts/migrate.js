require('dotenv').config();

const migrationRunnerModule = require('node-pg-migrate');
const migrationRunner = migrationRunnerModule.default || migrationRunnerModule;

const direction = process.argv[2] === 'down' ? 'down' : 'up';

// Ejecuta las migraciones de PostgreSQL usando la API programática de node-pg-migrate.
// Se usa un script propio (en vez del CLI) para cargar el .env de forma consistente
// entre sistemas operativos, incluyendo Windows.
migrationRunner({
  databaseUrl: process.env.DATABASE_URL,
  dir: 'server/src/migrations',
  direction,
  migrationsTable: 'pgmigrations',
  count: direction === 'down' ? 1 : Infinity,
})
  .then(() => {
    console.log(`Migraciones (${direction}) aplicadas correctamente.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error ejecutando migraciones:', error.message);
    process.exit(1);
  });
