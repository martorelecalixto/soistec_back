const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // Ex: server.database.windows.net
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // (true)Importante para acesso externo (Azure / SmarterASP) e (false) para acesso localhost
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Conectado ao SQL Server');
    return pool;
  })
  .catch(err => console.log('Falha ao conectar no DB:', err));

module.exports = {
  sql, poolPromise
};