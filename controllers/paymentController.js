require("dotenv").config();
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

const ecocashTransactionLookup = async (req, res) => {
  const { phone, reference } = req.body;

  try {
    const config = {
      method: "POST",
      url: "https://developers.ecocash.co.zw/api/ecocash_pay/api/v1/transaction/c2b/status/sandbox",
      timeout: 30000,
      headers: {
        "X-API-KEY": process.env.ECOCASH_API_KEY,
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ECOCASH_BEARER}`,
      },
      data: {
        sourceMobileNumber: phone,
        sourceReference: reference,
      },
    };

    console.log("Making EcoCash transaction lookup request with:", {
      phone,
      reference,
      apiKey: process.env.ECOCASH_API_KEY ? "Present" : "Missing",
      bearer: process.env.ECOCASH_BEARER ? "Present" : "Missing",
    });

    const response = await axios(config);
    console.log("EcoCash transaction lookup response:", response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Transaction lookup error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });

    return res.status(error.response?.status || 500).json({
      message: "Transaction lookup failed",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { ecocashPay, ecocashTransactionLookup };
