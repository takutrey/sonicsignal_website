const express = require("express");
const { signUpUser, signInUser, signOutUser, addUser, verifyAuth } = require("../controllers/user");
const { verifyUser } = require("../middleware/userAuthentication");

const router = express.Router();

router.patch("/signup", signUpUser);
router.post("/signin", signInUser);
router.post("/add-user", addUser);
router.delete("/signout", signOutUser);
router.get("/verify-auth", verifyAuth);

module.exports = router;