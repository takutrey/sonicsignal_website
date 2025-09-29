const express = require("express");
const router = express.Router();
const { uploadImage } = require("../middleware/uploadImage");
const { verifyUser, adminOnly } = require("../middleware/userAuthentication");
const {
  addTestimonial,
  activateTestimonial,
  getAllActiveTestimonials,
  getAllTestimonials,
} = require("../controllers/testimonials");

router.post("/add-testimonial", uploadImage, addTestimonial);
router.patch(
  "/update-testimonial/:id",
  verifyUser,
  adminOnly,
  activateTestimonial
);
router.get("/active-testimonials", getAllActiveTestimonials);
router.get("/all-testimonials", verifyUser, adminOnly, getAllTestimonials);

module.exports = router;
