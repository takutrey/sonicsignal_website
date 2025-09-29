const express = require("express");
const { uploadImage } = require("../middleware/uploadImage");
const { verifyUser, adminOnly } = require("../middleware/userAuthentication");
const { addProject, getAllProjects, updateProject } = require("../controllers/projects");

const router = express.Router();

router.post("/add-project", verifyUser, adminOnly, uploadImage, addProject);
router.patch(
  "/edit-project/:id",
  verifyUser,
  adminOnly,
  uploadImage,
  updateProject
);
router.get("/all-project", verifyUser, adminOnly, getAllProjects);
router.get("/all-projects", getAllProjects);

module.exports = router;
