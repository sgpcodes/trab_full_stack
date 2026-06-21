const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.mysql.database, env.mysql.user, env.mysql.password, {
  host: env.mysql.host,
  port: env.mysql.port,
  dialect: 'mysql',
  logging: false,
});

async function connectMysql({ retries = 10, delayMs = 3000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await sequelize.authenticate();
      console.log('[mysql] conectado com sucesso');
      return sequelize;
    } catch (err) {
      console.error(`[mysql] tentativa ${attempt}/${retries} falhou: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

async function disconnectMysql() {
  await sequelize.close();
}

module.exports = { sequelize, connectMysql, disconnectMysql };
