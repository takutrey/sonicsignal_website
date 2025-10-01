const Testimonials = require("../models/testimonials");
const db = require("../config/config");

const addTestimonial = async (req, res) => {
  const transaction = await db.transaction();
  const {
    firstname,
    lastname,
    position,
    company,
    comment,
    rating,
    recaptchaToken,
  } = req.body;

  try {
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({
        success: false,
        error: "reCAPTCHA verification failed",
      });
    }

    const testimonial = await Testimonials.create(
      {
        firstName: firstname,
        lastName: lastname,
        position,
        company,
        comment,
        rating,
        image: req.file?.path.replace(/\\/g, "/"),
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Testimonial sent",
      testimonial,
    });
  } catch (error) {
    await transaction.rollback();
    console.log("Error", error);
    return res.status(500).json({ message: "Unable to send testimonial" });
  }
};

const activateTestimonial = async (req, res) => {
  const transaction = await db.transaction();
  const { id } = req.params;

  try {
    const testimonial = await Testimonials.findByPk(id, { transaction });

    if (!testimonial) {
      await transaction.rollback();
      return res.status(404).json({ message: "Testimonial not found" });
    }

    let { isActive } = req.body;

    // Convert string to boolean if needed
    if (typeof isActive === "string") {
      isActive = isActive.toLowerCase() === "true";
    }

    if (typeof isActive !== "boolean") {
      await transaction.rollback();
      return res.status(400).json({ message: "isActive must be a boolean" });
    }

    testimonial.isActive = isActive;

    await testimonial.save({ transaction });
    await transaction.commit();

    console.log("updates", testimonial);

    return res
      .status(200)
      .json({ message: "Testimonial activated", testimonial });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: "Failed to activate testimonial" });
  }
};

const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonials.findAll();

    return res.status(200).json(testimonials);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch testimonials" });
  }
};

const getAllActiveTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonials.findAll({
      where: { isActive: true },
    });

    return res.status(200).json(testimonials);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to fetch active testimonials" });
  }
};

module.exports = {
  addTestimonial,
  activateTestimonial,
  getAllTestimonials,
  getAllActiveTestimonials,
};
