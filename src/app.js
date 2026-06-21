const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// OWASP - Security Misconfiguration: cabecalhos de seguranca e remocao do header X-Powered-By
app.disable('x-powered-by');
app.use(helmet());

// OWASP - Security Misconfiguration: CORS restrito por configuracao
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// OWASP - Injection: remove operadores Mongo ($) e prefixos suspeitos do corpo/query/params
app.use(mongoSanitize());

// OWASP - Injection: previne poluicao de parametros HTTP
app.use(hpp());

// OWASP - Security Logging and Monitoring Failures: log estruturado de requisicoes
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// OWASP - Insecure Design: limite de requisicoes geral e reforcado em rotas de autenticacao
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
