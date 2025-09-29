const { DataTypes } = require("sequelize");
const db = require("../config/config");
const Product = require("./product");

const ProductHistory = db.define(
  "product_history",
  {
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    change_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attribute_changed: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    old_value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    new_value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    changed_at:{
        type:DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
  },
  { freezeTableName: true, timestamps: true }
);

Product.hasMany(ProductHistory, {
  foreignKey: "product_id",
});

ProductHistory.belongsTo(Product, {
  foreignKey: "product_id",
});

module.exports = ProductHistory;
