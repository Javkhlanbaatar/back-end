const { Sequelize, DataTypes } = require("sequelize");
const { createPool, createConnection } = require("mysql2/promise"); // Updated import statement
const moment = require("moment");

let pool;

const sequelize = new Sequelize(
  process.env.MQ_DB,
  process.env.MQ_USER,
  process.env.MQ_PASSWORD,
  {
    host: process.env.MQ_HOST,
    port: process.env.MQ_PORT,
    dialect: "mysql",
    query: { raw: true },

    timezone: "+08:00",
    pool: {
      max: 30,
      min: 0,
      acquire: 600000,
      idle: 5000,
    },
    logging: false,
  }
);

async function initialize() {
  console.log("connecting to db...");

  createConnection({
    host: process.env.MQ_HOST,
    port: process.env.MQ_PORT,
    user: process.env.MQ_USER,
    password: process.env.MQ_PASSWORD,
  }).then((connection) => {
    connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MQ_DB};`).then(() => {
      // Safe to use sequelize now
    });
  });

  pool = createPool({
    host: process.env.MQ_HOST,
    port: process.env.MQ_PORT,
    database: process.env.MQ_DB,
    user: process.env.MQ_USER,
    password: process.env.MQ_PASSWORD,
  });

  try {
    // Test the connection
    const connection = await pool.getConnection();
    console.log("Connected to the database!");
    connection.release();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

// Rest of your code...

async function close() {
  console.log("db closing...");
}

module.exports = sequelize;

module.exports.initialize = initialize;
module.exports.close = close;
