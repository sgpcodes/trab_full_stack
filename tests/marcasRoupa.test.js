const request = require('supertest');
const app = require('../src/app');
const { connectAll, disconnectAll } = require('./helpers/db');

let token;
let marcaId;

beforeAll(async () => {
  await connectAll();
  const res = await request(app).post('/api/auth/register').send({
    nome: 'Usuario Marcas',
    email: 'usuario-marcas@example.com',
    senha: 'SenhaForte123',
  });
  token = res.body.token;
});

afterAll(async () => {
  await disconnectAll();
});

const marcaValida = {
  nome: 'Osklen',
  paisOrigem: 'Brasil',
  segmento: 'Casual',
  anoFundacao: 1989,
  siteOficial: 'https://osklen.com',
};

describe('Marcas de roupa', () => {
  it('nao deve listar marcas de roupa sem token', async () => {
    const res = await request(app).get('/api/marcas-roupa');
    expect(res.status).toBe(401);
  });

  it('deve criar uma marca de roupa', async () => {
    const res = await request(app)
      .post('/api/marcas-roupa')
      .set('Authorization', `Bearer ${token}`)
      .send(marcaValida);
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    marcaId = res.body._id;
  });

  it('nao deve criar marca de roupa com dados invalidos', async () => {
    const res = await request(app)
      .post('/api/marcas-roupa')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: '', paisOrigem: '', segmento: '', anoFundacao: 'invalido' });
    expect(res.status).toBe(400);
  });

  it('deve listar marcas de roupa', async () => {
    const res = await request(app).get('/api/marcas-roupa').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deve buscar uma marca de roupa por id', async () => {
    const res = await request(app).get(`/api/marcas-roupa/${marcaId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe(marcaValida.nome);
  });

  it('deve retornar 404 para marca de roupa inexistente', async () => {
    const res = await request(app)
      .get('/api/marcas-roupa/64b7f9c1a4f1f1f1f1f1f1f1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('deve atualizar uma marca de roupa', async () => {
    const res = await request(app)
      .put(`/api/marcas-roupa/${marcaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ segmento: 'Esportivo' });
    expect(res.status).toBe(200);
    expect(res.body.segmento).toBe('Esportivo');
  });

  it('deve remover uma marca de roupa', async () => {
    const res = await request(app).delete(`/api/marcas-roupa/${marcaId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('marca de roupa removida nao deve mais ser encontrada', async () => {
    const res = await request(app).get(`/api/marcas-roupa/${marcaId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
