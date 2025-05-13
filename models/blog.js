const { DataTypes } = require("sequelize");
const db = require("../config/config");
const blogCategory = require('./blogCategory');

const Blog = db.define(
  "blog",
  {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON, // or DataTypes.TEXT for comma-separated string
    allowNull: true,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  blogCategoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
        model: blogCategory,
        key: 'id'
    }
  },
},
{freezeTableName: true, timestamps: true}

);

module.exports = Blog;


