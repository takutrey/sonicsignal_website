const {sendInvoiceToEmail, getOrders, updateOrder} = require('..//controllers/orders');
const express = require('express');
const { verifyUser } = require('../middleware/userAuthentication');
const router = express.Router();

router.post('/send-invoice', sendInvoiceToEmail);
router.get('/get-orders', verifyUser, getOrders);
router.patch('/update-order/:id', verifyUser, updateOrder);

module.exports = router;