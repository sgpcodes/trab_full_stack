const swaggerJSDoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Trabalho Full Stack - API',
      version: '1.0.0',
      description:
        'API com Node.js e Express cobrindo dois contextos de persistencia (MongoDB e MySQL), autenticacao e autorizacao com JWT e protecoes baseadas na OWASP Top 10.',
    },
    servers: [{ url: '/api', description: 'Servidor da API' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
});

module.exports = swaggerSpec;
