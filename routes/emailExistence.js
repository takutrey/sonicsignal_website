const express = require("express");
const router = express.Router();
const { checkEmailExists } = require("../controllers/emailExistence");

router.get("/email-check", checkEmailExists);

module.exports = router;
