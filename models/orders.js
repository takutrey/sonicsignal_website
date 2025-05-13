'use strict';
const { DataTypes } = require('sequelize');
const db = require('../config/config');
const Customers = require('./customers');

const Orders = db.define(
  'orders',
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
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Customers,
        key: 'id',
      },
      validate: {
        notEmpty: true,
      },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending','completed'),
      defaultValue: 'pending',
    },
    
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Orders;
