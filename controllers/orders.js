const db = require('../config/config'); 
const easyInvoice = require('easyinvoice');
const generateInvoiceData = require('../middleware/invoiceData');
const fs = require('fs');
const Orders = require('../models/orders');
const OrderProducts = require("../models/orderproducts");
const Product = require("../models/product");
const Category = require("../models/category")
const {transporter} = require('../middleware/emailTransporter');
const path = require("path");
const {Op} = require("sequelize");
const Customers = require('../models/customers');

const sendInvoiceToEmail = async(req, res) => {
    const {email, orderData} = req.body;

    try {

        if(!email || !orderData){
            return res.status(400).json({
                error: 'Missing required email or order data'
            });
        }
        const customerInvoice = await easyInvoice.createInvoice(generateInvoiceData(orderData));
        const pdfInvoice = Buffer.from(customerInvoice.pdf, 'base64');
    
        const invoicePath = path.join(__dirname, `../invoices/invoice-${orderData.customer.lastName}-${orderData.orderNumber}.pdf`);
        fs.writeFileSync(invoicePath, pdfInvoice);
    
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email, 
            subject: `Invoice for ${orderData.customer.lastName} ${orderData.customer.firstName}, Order Number ${orderData.orderNumber}`,
            text: `Dear ${orderData.customer.firstName} ${orderData.customer.lastName}, 
    
            Thank you for shopping with us. Find your order details below.
    
            Order Number: ${orderData.orderNumber}
            Order Date: ${orderData.orderDate}
    
            NB: PLEASE SETTLE YOUR INVOICE WITHIN THE NEXT 7 DAYS.
    
            Please find your attached invoice.
    
            If you have any questions, please feel free to contact us.
    
            Best regards, 
    
            Sonicsignal Technologies     
            `, attachments: [{
                filename: `invoice-${orderData.customer.lastName}-${orderData.orderNumber}.pdf`,
                content: pdfInvoice
            }]
        });
    
        return res.status(200).json({
            message: 'Invoice sent successfully',
            invoicePath
        });
        
    } catch (error) {
        console.error('Invoice generation error', error);
        return res.status(500).json({
            error: 'Failed to generate or send invoice',
            details: error.message
        });      
    }
}

/*
const addOrderDetails = async(req, res) => {
    const transaction = await db.transaction();

    try{
        const {
            orderNumber,
            customer,  
            items,       
            total
        } = req.body;

        const {
            firstName,
            lastName,
            email,
            phone,
        } = customer;

        const totalAmount = total;
        
        
        if (!orderNumber || !firstName || !lastName || !email || !phone || !total || !items) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields: [
                    !orderNumber && 'orderNumber',
                    !firstName && 'customer.firstName',
                    !lastName && 'customer.lastName',
                    !email && 'customer.email',
                    !phone && 'customer.phone',
                    !items && 'items',
                    !total && 'total'
                ].filter(Boolean)
            });
        }

        const newOrder = await Orders.create({
            customerId: customer.id,                   
            total_amount: totalAmount, 
            status: "pending"
        }, {transaction}); 
        

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
                quantity: item.quantity, // ✅ fixed
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
        

        await transaction.commit();

        res.status(201).json({
            message: "Order created sucessfully",
            newOrder
        })

    } catch(error) {
        await transaction.rollback();
        console.error("Error creating order", error);
        res.status(500).json({
            message: "Internal server error", error
        })

    }
}
*/

const getOrders = async(req, res) => {
    try{
        const response = await Orders.findAll({
            include: [
                {
                    model: OrderProducts, 
                    include: [
                        {
                            model: Product,
                            attributes: ["id", "name"]
                        },
                      
                    ],

                }, 
                {
                    model: Customers, 
                    attributes: ["id", "firstName", "lastName", "phone", "email"], 
                }
                
            ],
            order: [["createdAt", "DESC"]],
        }); 

        const formattedOrders = response.map((order) => ({
            id: order.id, 
            totalAmount: order.total_amount,
            orderStatus: order.status,
            customer: order.customer ? {
                id: order.customer.id,
                firstName: order.customer.firstName, 
                lastName: order.customer.lastName, 
                phone: order.customer.phone,
                email: order.customer.email
            } : null,
            createdAt: order.createdAt, 
            products: order.orderproducts?.map((op) => ({
                id: op.product.id,
                name: op.product.name,
                priceAtPurchase: op.priceAtPurchase,
                quantity: op.quantity,
            
            })),
        }));
        
        

        return res.status(200).json(formattedOrders);
    } catch (error){
        return res.status(500).json({
            message: "Internal server error" + error.message
        })

    }
}

const updateOrder = async (req, res) => {
    const transaction = await db.transaction();
    
    try {
      // Get the order ID from the route parameter
      const orderId = req.params.id;
      
      // Get the orderStatus from request body
      const { orderStatus } = req.body;
  
      // Fetch the order with customer, order products, and product details
      const order = await Orders.findOne({
        where: { id: orderId },
        include: [
          {
            model: Customers, 
            required: true
          }, 
          {
            model: OrderProducts,
            required: true, 
            include: [
              {
                model: Product, 
                required: true, 
              }
            ]
          }
        ],
        transaction
      });
  
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: "Order not found" });
      }
  
      // Prepare the order details with customer and product information
      const orderDetails = {
        id: order.id, 
        totalAmount: parseFloat(order.total_amount),  // Ensure total_amount is a number
        orderStatus: order.status, 
        customer: {
          id: order.customer.id,
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          email: order.customer.email,
          phone: order.customer.phone
        }, 
        products: order.orderproducts.map((orderProduct) => ({
          name: orderProduct.product.name,
          priceAtPurchase: parseFloat(orderProduct.priceAtPurchase), // Ensure price is a number
          quantity: orderProduct.quantity
        }))
      };
  
      // Update the order status
      await order.update({ status: orderStatus }, { transaction });
  
      await transaction.commit();
      console.log("Order updated successfully");
  
      // Return the formatted order details
      return res.status(200).json(orderDetails);
  
    } catch (error) {
      await transaction.rollback();
      console.error("Error updating order status:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  



module.exports = {
    sendInvoiceToEmail, getOrders, updateOrder
}