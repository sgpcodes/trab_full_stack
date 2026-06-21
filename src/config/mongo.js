const mongoose = require('mongoose');
const env = require('./env');

async function connectMongo({ retries = 10, delayMs = 3000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri);
      console.log('[mongo] conectado com sucesso');
      return mongoose.connection;
    } catch (err) {
      console.error(`[mongo] tentativa ${attempt}/${retries} falhou: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

module.exports = { connectMongo, disconnectMongo, mongoose };
