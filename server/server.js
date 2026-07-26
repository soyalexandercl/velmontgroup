const { validateEnv } = require('./src/config/env');

validateEnv();

const { createApp } = require('./src/app');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Servidor de Velmont Group escuchando en el puerto ${PORT}`);
});
