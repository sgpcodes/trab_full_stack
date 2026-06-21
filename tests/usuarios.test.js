const request = require('supertest');
const app = require('../src/app');
const { connectAll, disconnectAll } = require('./helpers/db');

let tokenAdmin;
let tokenUserA;
let tokenUserB;
let idUserA;
let idUserB;

beforeAll(async () => {
  await connectAll();

  const admin = await request(app).post('/api/auth/register').send({
    nome: 'Admin Teste',
    email: 'admin-usuarios@example.com',
    senha: 'SenhaForte123',
    adminSecret: process.env.ADMIN_BOOTSTRAP_SECRET,
  });
  tokenAdmin = admin.body.token;

  const userA = await request(app).post('/api/auth/register').send({
    nome: 'Usuario A',
    email: 'usuario-a@example.com',
    senha: 'SenhaForte123',
  });
  tokenUserA = userA.body.token;
  idUserA = userA.body.usuario.id;

  const userB = await request(app).post('/api/auth/register').send({
    nome: 'Usuario B',
    email: 'usuario-b@example.com',
    senha: 'SenhaForte123',
  });
  tokenUserB = userB.body.token;
  idUserB = userB.body.usuario.id;
});

afterAll(async () => {
  await disconnectAll();
});

describe('Usuarios', () => {
  it('admin deve registrar com role admin', async () => {
    const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });

  it('usuario comum nao pode listar todos os usuarios', async () => {
    const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${tokenUserA}`);
    expect(res.status).toBe(403);
  });

  it('sem token nao pode acessar usuarios', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.status).toBe(401);
  });

  it('usuario pode buscar os proprios dados', async () => {
    const res = await request(app).get(`/api/usuarios/${idUserA}`).set('Authorization', `Bearer ${tokenUserA}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(idUserA);
    expect(res.body).not.toHaveProperty('senha');
  });

  it('usuario nao pode buscar dados de outro usuario', async () => {
    const res = await request(app).get(`/api/usuarios/${idUserB}`).set('Authorization', `Bearer ${tokenUserA}`);
    expect(res.status).toBe(403);
  });

  it('admin pode buscar dados de qualquer usuario', async () => {
    const res = await request(app).get(`/api/usuarios/${idUserA}`).set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });

  it('usuario pode atualizar os proprios dados', async () => {
    const res = await request(app)
      .put(`/api/usuarios/${idUserA}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ nome: 'Usuario A Atualizado' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Usuario A Atualizado');
  });

  it('usuario nao pode atualizar dados de outro usuario', async () => {
    const res = await request(app)
      .put(`/api/usuarios/${idUserB}`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ nome: 'Tentativa Invalida' });
    expect(res.status).toBe(403);
  });

  it('usuario comum nao pode remover usuarios', async () => {
    const res = await request(app).delete(`/api/usuarios/${idUserB}`).set('Authorization', `Bearer ${tokenUserA}`);
    expect(res.status).toBe(403);
  });

  it('admin pode remover um usuario', async () => {
    const res = await request(app).delete(`/api/usuarios/${idUserB}`).set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(204);
  });

  it('usuario removido nao deve mais ser encontrado', async () => {
    const res = await request(app).get(`/api/usuarios/${idUserB}`).set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(404);
  });
});
