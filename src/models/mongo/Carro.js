const { mongoose } = require('../../config/mongo');

const carroSchema = new mongoose.Schema(
  {
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    ano: { type: Number, required: true, min: 1900, max: 2100 },
    cor: { type: String, required: true, trim: true },
    preco: { type: Number, required: true, min: 0 },
    placa: { type: String, required: true, trim: true, uppercase: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Carro', carroSchema);
