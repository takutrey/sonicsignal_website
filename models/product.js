'use strict';
const { DataTypes } = require('sequelize');
const db = require('../config/config');
const Category = require('./category');

const Product = db.define(
  'product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        notEmpty: true,
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        notEmpty: true,
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock_status: {
      type: DataTypes.ENUM('In stock', 'Out of stock', 'Pre-order'),
      allowNull: false,
      defaultValue: 'In stock',
    },
  },
  { freezeTableName: true, timestamps: true }
);

module.exports = Product;
