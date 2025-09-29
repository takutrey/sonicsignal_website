require("dotenv").config();
const nodemailer = require("nodemailer"); 

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, 
    host: "smtp.gmail.com", 
    port: process.env.PORT, 
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

module.exports = {transporter};