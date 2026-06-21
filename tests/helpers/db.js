const { connectMongo, disconnectMongo } = require('../../src/config/mongo');
const { connectMysql, disconnectMysql, sequelize } = require('../../src/config/mysql');
const Usuario = require('../../src/models/sql/Usuario');

async function connectAll() {
  await connectMongo({ retries: 5, delayMs: 1000 });
  await connectMysql({ retries: 5, delayMs: 1000 });
  await sequelize.sync();
}

async function disconnectAll() {
  await disconnectMongo();
  await disconnectMysql();
}

module.exports = { connectAll, disconnectAll, Usuario };
