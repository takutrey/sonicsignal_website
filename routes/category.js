const express = require("express");
const {
  addCategory,
  updateCategory,
  getAllCategory,
  getAllActiveCategory,
  getSalesByCategory,
} = require("../controllers/category");
const { verifyUser, adminOnly } = require("../middleware/userAuthentication");
const router = express.Router();

router.post("/add-category", verifyUser, adminOnly, addCategory);
router.patch("/edit-category/:id", verifyUser, adminOnly, updateCategory);
router.get("/all-category", verifyUser, adminOnly, getAllCategory);
router.get("/active-category", verifyUser, adminOnly, getAllActiveCategory);
router.get("/get-sales-by-category", verifyUser, adminOnly, getSalesByCategory);

module.exports = router;
