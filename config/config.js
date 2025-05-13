const { Sequelize } = require("sequelize");
require("dotenv").config();

const db = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTION,
    dialectOptions: {
      timezone: "+02:00",
      dateStrings: true,
      typeCast: (field, next) => {
        if (field.type === "DATETIME") {
          return new Date(field.string() + "Z");
        }
        return next();
      },
    },
    timezone: "+02:00", 
  }
);

module.exports = db;