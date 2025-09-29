const { DataTypes } = require("sequelize");
const db = require("../config/config");

const ROLES = ["admin", "user"];

const User = db.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 32],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(...ROLES),
      allowNull: false,
      validate: {
        isIn: [ROLES],
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = User;
