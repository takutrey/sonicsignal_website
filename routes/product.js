const express = require("express");
const {
  addProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  getProductByCategoryId,
} = require("../controllers/product");
const { uploadImage } = require("../middleware/uploadImage");
const { verifyUser, adminOnly } = require("../middleware/userAuthentication");

const router = express.Router();

router.post("/add-products", verifyUser, adminOnly, uploadImage, addProduct);
router.patch(
  "/edit-product/:id",
  verifyUser,
  adminOnly,
  uploadImage,
  updateProduct
);
router.get("/all-products", verifyUser, adminOnly, getAllProducts);
router.get("/all-product", getAllProducts);
router.get("/product/:id",getProductById);
router.get("/category-product/:id", getProductByCategoryId);

module.exports = router;
