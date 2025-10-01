const express = require("express");
const {
  ecocashPay,
  ecocashTransactionLookup,
} = require("../controllers/paymentController");
const router = express.Router();

router.post("/ecocash-pay", ecocashPay);
router.post("/check-transaction", ecocashTransactionLookup);

module.exports = router;
