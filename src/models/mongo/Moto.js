const { mongoose } = require('../../config/mongo');

const motoSchema = new mongoose.Schema(
  {
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    ano: { type: Number, required: true, min: 1900, max: 2100 },
    cilindrada: { type: Number, required: true, min: 0 },
    cor: { type: String, required: true, trim: true },
    preco: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Moto', motoSchema);
