const express = require("express");
const {getAllBlogCategory, updateBlogCategory, addBlogCategory} = require("../controllers/blogCategory");
const { verifyUser, adminOnly } = require("../middleware/userAuthentication");
const router = express.Router();

router.post("/add-blog-category", verifyUser, adminOnly, addBlogCategory);
router.patch("/edit-blog-category/:id", verifyUser, adminOnly, updateBlogCategory);
router.get("/all-blog-category", verifyUser, adminOnly, getAllBlogCategory);

module.exports = router;
