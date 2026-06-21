const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

module.exports = function mongoCrudFactory(Model, nomeRecurso) {
  const listar = asyncHandler(async (req, res) => {
    const itens = await Model.find();
    res.status(200).json(itens);
  });

  const buscarPorId = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) throw new AppError(`${nomeRecurso} nao encontrado.`, 404);
    res.status(200).json(item);
  });

  const criar = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json(item);
  });

  const atualizar = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) throw new AppError(`${nomeRecurso} nao encontrado.`, 404);
    res.status(200).json(item);
  });

  const remover = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw new AppError(`${nomeRecurso} nao encontrado.`, 404);
    res.status(204).send();
  });

  return { listar, buscarPorId, criar, atualizar, remover };
};
