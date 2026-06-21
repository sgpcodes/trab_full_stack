const request = require('supertest');
const app = require('../src/app');
const { connectAll, disconnectAll } = require('./helpers/db');

let token;
let motoId;

beforeAll(async () => {
  await connectAll();
  const res = await request(app).post('/api/auth/register').send({
    nome: 'Usuario Motos',
    email: 'usuario-motos@example.com',
    senha: 'SenhaForte123',
  });
  token = res.body.token;
});

afterAll(async () => {
  await disconnectAll();
});

const motoValida = {
  marca: 'Honda',
  modelo: 'CB 500',
  ano: 2023,
  cilindrada: 500,
  cor: 'Vermelha',
  preco: 45000,
};

describe('Motos', () => {
  it('nao deve listar motos sem token', async () => {
    const res = await request(app).get('/api/motos');
    expect(res.status).toBe(401);
  });

  it('deve criar uma moto', async () => {
    const res = await request(app).post('/api/motos').set('Authorization', `Bearer ${token}`).send(motoValida);
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    motoId = res.body._id;
  });

  it('nao deve criar moto com dados invalidos', async () => {
    const res = await request(app)
      .post('/api/motos')
      .set('Authorization', `Bearer ${token}`)
      .send({ marca: '', modelo: '', ano: 'invalido', cilindrada: -1, cor: '', preco: -10 });
    expect(res.status).toBe(400);
  });

  it('deve listar motos', async () => {
    const res = await request(app).get('/api/motos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deve buscar uma moto por id', async () => {
    const res = await request(app).get(`/api/motos/${motoId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.modelo).toBe(motoValida.modelo);
  });

  it('deve retornar 404 para moto inexistente', async () => {
    const res = await request(app)
      .get('/api/motos/64b7f9c1a4f1f1f1f1f1f1f1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('deve atualizar uma moto', async () => {
    const res = await request(app)
      .put(`/api/motos/${motoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cor: 'Azul' });
    expect(res.status).toBe(200);
    expect(res.body.cor).toBe('Azul');
  });

  it('deve remover uma moto', async () => {
    const res = await request(app).delete(`/api/motos/${motoId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('moto removida nao deve mais ser encontrada', async () => {
    const res = await request(app).get(`/api/motos/${motoId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
