const express = require('express');
const router = express.Router();
const {addCustomer, getCustomers} = require('../controllers/customer');
const { verifyUser } = require('../middleware/userAuthentication');

router.post('/add-customer', addCustomer);
router.get("/get-customers", verifyUser, getCustomers)


module.exports = router;