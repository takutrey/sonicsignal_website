const { DataTypes } = require("sequelize");
const db = require("../config/config");

const blogCategory = db.define(
  "blogcategory",
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
  },
  { freezeTableName: true, timestamps: true }
);

module.exports = blogCategory;
