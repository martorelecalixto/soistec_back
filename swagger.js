const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistrade - Usuários e Autenticação',
      version: '1.0.0',
      description: 'API simples com CRUD de usuários e autenticação com login/logout usando Node.js, Express e SQL Server',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER || 'http://localhost:3000',
        description: 'Servidor local de desenvolvimento',
      },
    ],
  },
  apis: ['./routes/*.js'], // ✅ Isso cobre usuariosRoutes.js e authRoutes.js se estiverem na pasta /routes
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;