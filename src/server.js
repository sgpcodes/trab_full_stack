const app = require('./app');
const env = require('./config/env');
const { connectMongo } = require('./config/mongo');
const { sequelize, connectMysql } = require('./config/mysql');
require('./models/sql/Usuario');

async function start() {
  await connectMongo();
  await connectMysql();
  await sequelize.sync();

  app.listen(env.port, () => {
    console.log(`[server] API rodando na porta ${env.port} (ambiente: ${env.nodeEnv})`);
    console.log(`[server] Documentacao Swagger disponivel em /api-docs`);
  });
}

start().catch((err) => {
  console.error('[server] falha ao iniciar a aplicacao:', err);
  process.exit(1);
});
