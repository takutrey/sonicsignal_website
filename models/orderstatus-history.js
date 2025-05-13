'use strict';
const { DataTypes } = require('sequelize');
const db = require('../config/config');
const Orders = require('./orders');

const OrderStatusHistory = db.define(
  'orderstatushistory',
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
    status: {
        type: DataTypes.ENUM('pending','completed'),
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = OrderStatusHistory;
