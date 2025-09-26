const db = require("../config/config");
require("dotenv").config();
const Orders = require("../models/orders");
const OrderProducts = require("../models/orderproducts");
const axios = require("axios");

const ecocashPay = async (req, res) => {
  const { phone, total, reference } = req.body;

  try {
    const config = {
      method: "POST",
      url: "https://developers.ecocash.co.zw/api/ecocash_pay/api/v2/payment/instant/c2b/sandbox",
      timeout: 30000,
      headers: {
        "X-API-KEY": `${process.env.ECOCASH_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: {
        customerMsisdn: phone,
        amount: `${total}`,
        reason: "Payment",
        currency: "USD",
        sourceReference: `${reference}`,
      },
    };

    axios(config)
      .then(function (response) {
        console.log(response.data);
        return res.status(200).json(response.data);
      })
      .catch(function (error) {
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
        return res.status(500).json({ error: "Payment failed" });
      });
  } catch (error) {
    console.error("Error ecocash", error.message);
    return res.status(500).json({
      message: "Payment error",
    });
  }
};

module.exports = { ecocashPay };
