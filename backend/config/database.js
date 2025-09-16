const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('note', 'root', '12345678', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;