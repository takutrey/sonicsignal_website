const db = require('../config/config');
const Orders = require('../models/orders');
const OrderProducts = require('../models/orderproducts');
const Product = require('../models/product');
const Customers = require('../models/customers');
const { Op } = require('sequelize');

const addCustomer = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { orderNumber, customer, items, total } = req.body;
    const { firstName, lastName, email, phone } = customer;

    const totalAmount = total;

    // Check if the customer already exists
    let existingCustomer = await Customers.findOne({
      where: { email }
    });

    // If the customer doesn't exist, create a new one
    if (!existingCustomer) {
      existingCustomer = await Customers.create({
        firstName,
        lastName,
        email,
        phone
      }, { transaction });
    }

    // Create the order
    const newOrder = await Orders.create({     
      customerId: existingCustomer.id,
      total_amount: totalAmount,
      status: "pending"
    }, { transaction });

    // Add the order products (items)
    for (let item of items) {
      const product = await Product.findOne({
          where: { id: item.id },
          transaction
      });
  
      if (!product) {
          throw new Error(`Product with id ${item.id} not found`);
      }
  
      if (product.quantity < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
      }
  
      await OrderProducts.create({
          orderId: newOrder.id,
          productId: item.id,
          quantity: item.quantity, 
          priceAtPurchase: product.price,
      }, { transaction });
  
      await Product.update(
          {
              quantity: product.quantity - item.quantity,
          },
          {
              where: { id: item.id },
              transaction
          }
      );
  }

    // Commit the transaction after everything is successful
    await transaction.commit();

    res.status(201).json({
      message: "Order created successfully",
      newOrder,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error creating customer or order:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getCustomers = async(req, res) => {
  try {
    const response = await Customers.findAll(); 

    res.status(200).json({
      message: "Customers fetched successfully", 
      customers: response
    });
    
  } catch (error) {
    console.error("Error fetching customers", error.message); 
    res.status(500).json({
      message: "Internal server error", 
      error: error.message
    });
    
  }
}

module.exports = { addCustomer, getCustomers };
