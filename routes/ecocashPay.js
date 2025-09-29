const express = require("express");
const { ecocashPay } = require("../controllers/paymentController");
const router = express.Router();

router.post("/ecocash-pay", ecocashPay);

module.exports = router;
