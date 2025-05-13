const db = require("../config/config");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { Op } = require("sequelize");

const saltRounds = 12;

const signUpUser = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { email, password, confirmPassword } = req.body;

    //check if passwords match
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords does not match" });

    if (password.length < 8 || password.length > 16) {
      return res
        .status(400)
        .json({ message: "Password must be between 8 and 16 characters" });
    }

    //check if user is in the system

    const user = await User.findOne({
      where: {
        email,
        password: { [Op.eq]: null },
      },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Invalid emailAddress, user not found in the system!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;

    await user.save({ transaction });
    await transaction.commit();

    return res.status(200).json({ message: "User signed up successfully!" });
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const signInUser = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
      },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "Invalid email or password" });
    }

    //verify is passwords match
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong email/password!!"});
    }

    req.session.userId = user.id;
    const name = user.name;
    const role = user.role;

    await transaction.commit();

    return res
      .status(200)
      .json({ message: "Login successful", name, role, email });
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const addUser = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { name, email, role } = req.body;
    const user = await User.findOne({
      where: {
        email,
      },
      transaction,
    });

    if (user) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    await User.create(
      {
        name,
        email,
        role,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({ message: "User registered successfully!" });
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const signOutUser = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ message: "Can not logout" });
    res.status(200).json({ message: "You have logout" });
  });
};

const verifyAuth = async (req, res) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findByPk(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      return res.status(200).json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error: " + error.message });
    }
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
};





module.exports = { signUpUser, signInUser, signOutUser, addUser, verifyAuth };
