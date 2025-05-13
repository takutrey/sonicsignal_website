const {transporter} = require("../middleware/emailTransporter"); 
const axios = require("axios");

const contactUs = async(req, res) => {
    const {name, email, message, token} = req.body; 

    try {
        if(!email || !message || !name || !token) {
            return res.status(400).json({
                error: "Missing required email, full name or message"
            }); 

        }

        const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);

        if(!recaptchaResponse.data.success) { 
            return res.status(400).json({
                success: false, 
                error: "Recaptcha verification failed"
            })
        }

        await transporter.sendMail({
            from: email, 
            to: process.env.EMAIL_USER, 
            subject: "Website Messages", 
            text: `
            From: ${name}
            Email: ${email} 
            message: ${message}
            `
        }); 

        return res.status(200).json({
            message: 'Message sent successfully', 
            success: true
        });
        
    } catch (error) {
        console.error("Email not sent", error);
        return res.status(500).json({
            error: "Failed to send email"
        })
        
    }
}

module.exports = { contactUs };