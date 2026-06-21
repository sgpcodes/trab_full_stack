# Trabalho Full Stack — API Node.js + Express

API REST que combina dois contextos de persistência (MongoDB e MySQL), autenticação/autorização com JWT, boas práticas de segurança baseadas na OWASP Top 10, documentação automática via Swagger e testes de integração com Jest + Supertest. Toda a execução acontece via Docker.

## Recursos da API

- **Usuários** (MySQL/Sequelize) — cadastro, autenticação e CRUD com controle de acesso.
- **Carros**, **Motos** e **Marcas de roupa** (MongoDB/Mongoose) — CRUD completo, protegido por JWT.

## Stack utilizada

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js + Express |
| Persistência NoSQL | MongoDB + Mongoose |
| Persistência relacional | MySQL + Sequelize |
| Autenticação | JWT (jsonwebtoken) + bcryptjs |
| Validação | express-validator |
| Segurança | helmet, cors, hpp, express-mongo-sanitize, express-rate-limit |
| Documentação | swagger-jsdoc + swagger-ui-express |
| Testes | Jest + Supertest |
| Conteinerização | Docker + Docker Compose |

## Como executar (via Docker)

Pré-requisitos: Docker e Docker Compose instalados.

1. Copie o arquivo de exemplo de variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

2. Suba a aplicação e os bancos de dados:

   ```bash
   docker compose up --build
   ```

3. A API estará disponível em `http://localhost:3000`.
   - Documentação Swagger: `http://localhost:3000/api-docs`
   - Health check: `http://localhost:3000/health`

Para parar e remover os containers:

```bash
docker compose down
```

> Não é necessário (e não deve ser usado) `npm install`, `npm run dev` ou `npm start` no host — tudo roda dentro dos containers definidos no `docker-compose.yml`.

## Como executar os testes de integração (via Docker)

Os testes rodam em uma stack isolada (`docker-compose.test.yml`), com instâncias efêmeras de MongoDB e MySQL, para não afetar os dados de desenvolvimento:

```bash
docker compose -f docker-compose.test.yml up --build --exit-code-from api-test
```

Ao final, derrube os containers de teste:

```bash
docker compose -f docker-compose.test.yml down -v
```

Os testes cobrem: autenticação (registro/login/sessão), CRUD de usuários (com regras de autorização admin/dono do recurso) e CRUD completo de carros, motos e marcas de roupa, incluindo casos de sucesso, validação, autorização e recursos não encontrados.

## Autenticação e autorização

- `POST /api/auth/register` cria um usuário (papel `user` por padrão). Para criar um usuário com papel `admin`, é necessário enviar o campo `adminSecret` igual ao valor de `ADMIN_BOOTSTRAP_SECRET` definido no `.env` — isso evita que qualquer usuário se autopromova a administrador.
- `POST /api/auth/login` retorna um token JWT, que deve ser enviado no header `Authorization: Bearer <token>` em todas as rotas protegidas.
- Rotas de `carros`, `motos` e `marcas-roupa` exigem apenas um usuário autenticado.
- Rotas de `usuarios`: listar e remover exigem papel `admin`; buscar e atualizar exigem ser o próprio usuário ou um `admin`.

## Estrutura do projeto

```
src/
  config/       # env, conexões (mongo/mysql) e configuração do swagger
  models/       # modelos Mongoose (mongo/) e Sequelize (sql/)
  middlewares/  # autenticação, validação, rate limit, tratamento de erros
  controllers/  # regras de negocio dos recursos
  routes/       # definição de rotas e documentação swagger (JSDoc)
  app.js        # configuração do Express (sem listen)
  server.js     # conecta bancos e inicia o servidor
tests/          # testes de integração (Jest + Supertest)
docs/           # documentação escrita do trabalho
```

## Documentação escrita

Ver [docs/DOCUMENTACAO.md](docs/DOCUMENTACAO.md) para a explicação detalhada de arquitetura, tecnologias e decisões adotadas.
