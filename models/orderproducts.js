'use strict';
const { DataTypes } = require('sequelize');
const db = require('../config/config');
const Orders = require('./orders');
const Product = require('./product');

const OrderProducts = db.define(
  'orderproducts',
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
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Orders,
        key: 'id',
      },
      validate: {
        notEmpty: true,
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
      validate: {
        notEmpty: true,
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    priceAtPurchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        notEmpty: true,
      },
    },
    
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
  }
);


module.exports = OrderProducts;
