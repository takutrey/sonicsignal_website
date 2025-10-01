const { transporter } = require("../middleware/emailTransporter");
const axios = require("axios");

const contactUs = async (req, res) => {
  const { name, email, message, token } = req.body;

  try {
    // Better validation with proper checks
    if (!email || !message || !name || !token) {
      console.log("Missing fields:", { name, email, message, token });
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, message, or token",
      });
    }

    // Validate field types and formats
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Invalid name",
      });
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    if (typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Invalid message",
      });
    }

    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({
        success: false,
        error: "Recaptcha verification failed",
      });
    }

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: "Website Messages",
      text: `
            From: ${name}
            Email: ${email} 
            Message: ${message}
            `,
    });

    return res.status(200).json({
      message: "Message sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Email not sent", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send email",
    });
  }
};

module.exports = { contactUs };
