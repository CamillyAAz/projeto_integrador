const { Sequelize } = require('sequelize');

const useSqlite = (process.env.DB_DIALECT || '').toLowerCase() === 'sqlite';

const sequelize = useSqlite
  ? new Sequelize({ dialect: 'sqlite', storage: process.env.DB_SQLITE_PATH || 'database.sqlite', logging: false })
  : new Sequelize(
      process.env.DB_NAME || 'projetoIntegrador',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || 'raposa',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
      }
    );

module.exports = sequelize;