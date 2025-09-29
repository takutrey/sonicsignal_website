'use strict';
const { DataTypes } = require('sequelize');
const db = require('../config/config');
const Category = require('./category');

const Projects = db.define(
  'projects',
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    project_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    project_status: {
      type: DataTypes.ENUM('completed', 'In progress'),
      allowNull: false,
      defaultValue: 'completed',
    },
  },
  { freezeTableName: true, timestamps: true }
);

module.exports = Projects;
