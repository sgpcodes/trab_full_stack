const { mongoose } = require('../../config/mongo');

const marcaRoupaSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    paisOrigem: { type: String, required: true, trim: true },
    segmento: { type: String, required: true, trim: true },
    anoFundacao: { type: Number, required: true, min: 1800, max: 2100 },
    siteOficial: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MarcaRoupa', marcaRoupaSchema);
