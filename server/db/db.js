const user = 'postgres';
const host = 'localhost';
const database = 'tests';
const password = 'rma';
const port = '5432';
const { Sequelize } = require('sequelize');

const db = new Sequelize(database, user, password, {
    host,
    port,
    dialect: 'postgres',
    logging: false
});

module.exports = db;
