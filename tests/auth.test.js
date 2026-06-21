const request = require('supertest');
const app = require('../src/app');
const { connectAll, disconnectAll } = require('./helpers/db');

beforeAll(async () => {
  await connectAll();
});

afterAll(async () => {
  await disconnectAll();
});

const usuario = {
  nome: 'Usuario Auth Teste',
  email: 'auth-teste@example.com',
  senha: 'SenhaForte123',
};

describe('Autenticacao', () => {
  it('deve registrar um novo usuario e retornar token', async () => {
    const res = await request(app).post('/api/auth/register').send(usuario);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.email).toBe(usuario.email);
    expect(res.body.usuario).not.toHaveProperty('senha');
  });

  it('nao deve registrar usuario com e-mail duplicado', async () => {
    const res = await request(app).post('/api/auth/register').send(usuario);
    expect(res.status).toBe(409);
  });

  it('deve rejeitar registro com dados invalidos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: '', email: 'invalido', senha: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('deve autenticar com credenciais corretas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: usuario.email, senha: usuario.senha });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('nao deve autenticar com senha incorreta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: usuario.email, senha: 'senhaErrada' });
    expect(res.status).toBe(401);
  });

  it('deve retornar os dados do usuario autenticado em /auth/me', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: usuario.email, senha: usuario.senha });
    const token = login.body.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(usuario.email);
  });

  it('deve rejeitar acesso a /auth/me sem token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('deve rejeitar acesso a /auth/me com token invalido', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });
});
