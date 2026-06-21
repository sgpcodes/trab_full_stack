module.exports = async function globalSetup() {
  const { connectMongo, disconnectMongo, mongoose } = require('../src/config/mongo');
  const { connectMysql, disconnectMysql } = require('../src/config/mysql');
  const Usuario = require('../src/models/sql/Usuario');

  await connectMongo();
  await mongoose.connection.dropDatabase();
  await disconnectMongo();

  await connectMysql();
  await Usuario.sync({ force: true });
  await disconnectMysql();
};
