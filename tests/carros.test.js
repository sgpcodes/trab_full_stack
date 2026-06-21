const request = require('supertest');
const app = require('../src/app');
const { connectAll, disconnectAll } = require('./helpers/db');

let token;
let carroId;

beforeAll(async () => {
  await connectAll();
  const res = await request(app).post('/api/auth/register').send({
    nome: 'Usuario Carros',
    email: 'usuario-carros@example.com',
    senha: 'SenhaForte123',
  });
  token = res.body.token;
});

afterAll(async () => {
  await disconnectAll();
});

const carroValido = {
  marca: 'Fiat',
  modelo: 'Argo',
  ano: 2022,
  cor: 'Preto',
  preco: 75000,
  placa: 'ABC1D23',
};

describe('Carros', () => {
  it('nao deve listar carros sem token', async () => {
    const res = await request(app).get('/api/carros');
    expect(res.status).toBe(401);
  });

  it('deve criar um carro', async () => {
    const res = await request(app).post('/api/carros').set('Authorization', `Bearer ${token}`).send(carroValido);
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    carroId = res.body._id;
  });

  it('nao deve criar carro com dados invalidos', async () => {
    const res = await request(app)
      .post('/api/carros')
      .set('Authorization', `Bearer ${token}`)
      .send({ marca: '', modelo: '', ano: 'invalido', cor: '', preco: -10, placa: '' });
    expect(res.status).toBe(400);
  });

  it('deve listar carros', async () => {
    const res = await request(app).get('/api/carros').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deve buscar um carro por id', async () => {
    const res = await request(app).get(`/api/carros/${carroId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.placa).toBe(carroValido.placa);
  });

  it('deve retornar 400 para id invalido', async () => {
    const res = await request(app).get('/api/carros/id-invalido').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('deve retornar 404 para carro inexistente', async () => {
    const res = await request(app)
      .get('/api/carros/64b7f9c1a4f1f1f1f1f1f1f1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('deve atualizar um carro', async () => {
    const res = await request(app)
      .put(`/api/carros/${carroId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cor: 'Branco' });
    expect(res.status).toBe(200);
    expect(res.body.cor).toBe('Branco');
  });

  it('deve remover um carro', async () => {
    const res = await request(app).delete(`/api/carros/${carroId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('carro removido nao deve mais ser encontrado', async () => {
    const res = await request(app).get(`/api/carros/${carroId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
