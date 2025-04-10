const { Sequelize } = require('sequelize');
require('dotenv').config();

// Constructing the DB_URI from .env variables
const DB_URI = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Create a Sequelize instance to interact with the MySQL database
const sequelize = new Sequelize(DB_URI, {
  dialect: 'mysql',
  logging: false, // Disable query logging for cleaner output
});
console.log('is there working? ')
// Sync function to create tables if they don't exist
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    // await sequelize.sync();
    // // Sync models with database
    // await sequelize.sync({ alter: true, force: false });  
    // // Use { force: true } only if you want to drop and recreate tables
    // console.log('Database synced.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

module.exports = { syncDatabase, sequelize };
