const User = require("../models/user");

const verifyUser = async (req, res, next) => {
  try {
    // Validate session existence:
    if (!req.session) {
      return res.status(401).json({ message: "Please login to your account!" });
    }

    if (!req.session.userId) {
      req.session.destroy(); // Clear potentially invalid session
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing user ID in session." });
    }

    const user = await User.findOne({
      where: {
        id: req.session.userId,
      },
    });

    // Handle user not found:
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    // Set user data on request object:
    req.userId = user.id;
    req.role = user.role;
    req.name = user.name;
    req.email = user.email;

    // Call next middleware function:
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const adminOnly = async (req, res, next) => {
  const user = await User.findOne({
    where: {
      id: req.session.userId,
    },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Access forbidden, Administrator only!" });
  next();
};


module.exports = { verifyUser, adminOnly };