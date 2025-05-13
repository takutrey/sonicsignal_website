const express = require("express");
const {addBlog, updateBlog, getAllBlogs, getBlogById, getBlogsByCategory} = require("../controllers/blog");
const { uploadImage } = require("../middleware/uploadImage");
const { verifyUser, adminOnly } = require("../middleware/userAuthentication");

const router = express.Router();

router.post("/add-blog", verifyUser, adminOnly, uploadImage, addBlog);
router.patch(
  "/edit-blog/:id",
  verifyUser,
  adminOnly,
  uploadImage,
  updateBlog
);
router.get("/all-blog", verifyUser, adminOnly, getAllBlogs);
router.get("/all-blogs", getAllBlogs);
router.get("/blog/:id",getBlogById);
router.get("/category-blog/:id", getBlogsByCategory);

module.exports = router;
