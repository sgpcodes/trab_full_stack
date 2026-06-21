# Documentação do Trabalho

Este projeto implementa uma API backend com Node.js e Express que combina dois contextos de persistência de dados, conforme exigido pela atividade.

## Persistência de dados

1. Um banco **NoSQL** (MongoDB, via Mongoose) para os recursos de catálogo: carro, moto e marca de roupa.
2. Um banco **relacional SQL** (MySQL, via Sequelize) para o cadastro e autenticação de usuários do sistema.

## Autenticação

3. A autenticação é feita com JSON Web Tokens (JWT): no registro e no login, a API gera um token assinado com um segredo definido em variável de ambiente (`JWT_SECRET`), com tempo de expiração configurável.
4. Esse token deve ser enviado no cabeçalho `Authorization: Bearer <token>` para acessar qualquer rota protegida.
5. As senhas nunca são armazenadas em texto puro: utilizamos `bcryptjs` para gerar o hash antes de persistir no banco, e o modelo de usuário usa um "default scope" do Sequelize para nunca retornar o campo de senha nas respostas da API.

## Autorização

6. A autorização segue dois níveis: usuários autenticados (qualquer papel) podem operar o CRUD de carros, motos e marcas de roupa.
7. Já o CRUD de usuários distingue entre o papel `admin` (pode listar todos os usuários e remover qualquer um) e o próprio usuário (pode visualizar e atualizar apenas os seus próprios dados).
8. Para evitar que um usuário comum se autopromova a administrador, a criação de um usuário `admin` exige o envio de um segredo de bootstrap (`ADMIN_BOOTSTRAP_SECRET`) que só quem administra o ambiente conhece — uma medida explícita de controle de acesso (item da OWASP Top 10 "Broken Access Control").

## Mitigações da OWASP Top 10

9. Cabeçalhos de segurança HTTP via `helmet`.
10. Sanitização de entradas contra injeção de operadores do MongoDB via `express-mongo-sanitize`.
11. Proteção contra poluição de parâmetros HTTP via `hpp`.
12. Validação rigorosa de entrada em todas as rotas com `express-validator`, rejeitando tipos, formatos e valores fora do esperado antes de chegar à camada de persistência.
13. Uso de ORM/ODM com queries parametrizadas (Sequelize e Mongoose), evitando injeção de SQL/NoSQL.
14. Limitação de taxa de requisições (`express-rate-limit`), com um limite mais restrito especificamente nas rotas de autenticação para mitigar força bruta.
15. Tratamento de erros centralizado que nunca expõe stack traces ou detalhes internos em ambiente de produção.

## Documentação automática

16. A documentação da API é gerada automaticamente com `swagger-jsdoc` a partir de anotações JSDoc presentes nos próprios arquivos de rota.
17. Ela é exposta de forma interativa pelo `swagger-ui-express` no caminho `/api-docs`, permitindo testar todos os endpoints diretamente pelo navegador, incluindo o fluxo de autenticação via Bearer Token.

## Testes de integração

18. Os testes de integração foram escritos com Jest e Supertest, cobrindo todos os recursos da aplicação (autenticação, usuários, carros, motos e marcas de roupa) com casos de sucesso, validação de dados inválidos, autorização e busca de recursos inexistentes.
19. Os testes rodam contra instâncias reais e efêmeras de MongoDB e MySQL, orquestradas por um `docker-compose.test.yml` dedicado, isolado da stack de desenvolvimento.
20. Isso garante que os testes validem o comportamento real de integração entre a aplicação e os bancos de dados, e não apenas mocks.

## Conteinerização

21. O `Dockerfile` define a imagem da API (Node 20 Alpine).
22. O `docker-compose.yml` orquestra três serviços — a API, o MongoDB e o MySQL — com volumes nomeados para persistência de dados e lógica de reconexão com tentativas (retry) na inicialização, já que os bancos podem demorar alguns segundos para ficar prontos.
23. A execução do projeto, conforme exigido, acontece inteiramente via `docker compose up`, sem depender de `npm start` ou `npm run dev` no host.

## Variáveis de ambiente

24. As variáveis sensíveis (segredo do JWT, segredo de bootstrap de admin, credenciais dos bancos) são centralizadas em um arquivo `.env`.
25. É fornecido um arquivo de exemplo (`.env.example`) com instruções de uso, nunca commitado com valores reais de produção.
