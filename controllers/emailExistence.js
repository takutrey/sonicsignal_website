const emailExistence = require("email-existence");

const checkEmailExists = async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) {
      return res
        .status(400)
        .json({ exists: false, message: "Email is required" });
    }

    emailExistence.check(`${email}`, (error, response) => {
      if (error) {
        console.error("MX Check Error:", error);
        return res.status(550).json({ exists: false, message: error.message });
      }

      console.log("Email check", response);

      return res.status(200).json({ exists: response });
    });
  } catch (error) {
    console.log("Catch error", error.message);
    return res.status(500).json({
      exists: false,
      message: error.message,
    });
  }
};

module.exports = { checkEmailExists };
