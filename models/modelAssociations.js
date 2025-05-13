const Orders = require('./orders');
const Product = require('./product');
const Category = require('./category');
const OrderProducts = require('./orderproducts');
const Customers = require('./customers');
const OrderStatusHistory = require('./orderstatus-history');
const Blog = require("./blog");
const BlogCategory = require("./blogCategory"); 
const Projects = require('./projects');


const modelAssociations = () => {
    // Many-to-many relationship between Orders and Products through OrderProducts
    Orders.belongsToMany(Product, {
        through: OrderProducts,
        foreignKey: 'orderId',
        otherKey: 'productId',
    });

    Product.belongsToMany(Orders, {
        through: OrderProducts,
        foreignKey: 'productId',
        otherKey: 'orderId',
    });

    // One-to-many relationship between Category and Product
    Product.belongsTo(Category, {
        foreignKey: 'category_id',
        onDelete: 'CASCADE',
    });

    Category.hasMany(Product, {
        foreignKey: 'category_id',
        onDelete: 'CASCADE',
    });

    // One-to-many relationship: Orders -> OrderProducts
    Orders.hasMany(OrderProducts, {
        foreignKey: 'orderId',
        onDelete: 'CASCADE',
    });

    OrderProducts.belongsTo(Orders, {
        foreignKey: 'orderId',
        onDelete: 'CASCADE',
    });

    // One-to-many relationship: Products -> OrderProducts
    Product.hasMany(OrderProducts, {
        foreignKey: 'productId',
        onDelete: 'CASCADE',
    });

    OrderProducts.belongsTo(Product, {
        foreignKey: 'productId',
        onDelete: 'CASCADE',
    });

    // One-to-many: Customers -> Orders
    Customers.hasMany(Orders, {
        foreignKey: 'customerId',
        onDelete: 'CASCADE',
    });

    Orders.belongsTo(Customers, {
        foreignKey: 'customerId',
        onDelete: 'CASCADE',
    });

    // One-to-many: Orders -> OrderStatusHistory
    Orders.hasMany(OrderStatusHistory, {
        foreignKey: 'orderId',
        onDelete: 'CASCADE',
    });

    OrderStatusHistory.belongsTo(Orders, {
        foreignKey: 'orderId',
        onDelete: 'CASCADE',
    });

    Blog.belongsTo(BlogCategory, { foreignKey: 'blogCategoryId'});
    BlogCategory.hasMany(Blog, { foreignKey: 'blogCategoryId', onDelete: 'CASCADE'});

    Projects.hasMany(Projects, { foreignKey: 'id', constraints: false });

};

module.exports = modelAssociations;
