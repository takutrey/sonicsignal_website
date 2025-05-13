const db = require("../config/config");
const Category = require("../models/category");
const Product = require("../models/product");
const ProductHistory = require("../models/product-history");
const pluralize = require("pluralize");

const { Op, literal } = require("sequelize");

const addProduct = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const {
      name,
      category_id,
      price,
      quantity,
      description,
      specifications,
      brand,
      stock_status,
    } = req.body;

    // Parse the specifications field if it's a JSON string
    let parsedSpecifications = specifications;
    if (typeof specifications === "string") {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (error) {
        return res.status(400).json({
          message: "Invalid JSON format for specifications",
        });
      }
    }

    // Validate the name
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid product name" });
    }

    // Validate the specifications
    if (parsedSpecifications && typeof parsedSpecifications !== "object") {
      return res
        .status(400)
        .json({ message: "Specifications must be a JSON object" });
    }

    const lowerCaseName = name.toLowerCase().trim();

    const singularName = pluralize.singular(lowerCaseName) || lowerCaseName;
    const pluralName = pluralize.plural(lowerCaseName) || lowerCaseName;
    const noSpaces = lowerCaseName.replace(/\s+/g, "");
    const noHyphens = lowerCaseName.replace(/[-_]/g, "");

    const nameVariations = new Set([
      lowerCaseName,
      singularName,
      pluralName,
      noSpaces,
      noHyphens,
    ]);

    const product = await Product.findOne({
      where: {
        category_id,
        price,
        [Op.or]: [...nameVariations].map((variation) => ({
          [Op.and]: [literal(`LOWER(name) = LOWER('${variation}')`)],
        })),
      },
      transaction,
    });

    if (product) {
      await transaction.rollback();
      return res.status(400).json({
        message: "A product with that name and category already exists",
      });
    }

    await Product.create(
      {
        name,
        category_id,
        price,
        brand,
        quantity,
        stock_status,
        description,
        specifications: JSON.stringify(parsedSpecifications), // Store as JSON string
        image: req.file?.path.replace(/\\/g, "/"),
      },
      { transaction }
    );


    await transaction.commit();

    res.status(200).json({
      message: "Product added successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const product = await Product.findByPk(req.params.id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Product not found!",
      });
    }

    const updates = req.body;
    console.log("Updates", updates);

    // Update fields if they have changed
    for (const field in updates) {
      if (field === "specifications") {
        // Parse specifications if it's a JSON string
        if (typeof updates[field] === "string") {
          try {
            product[field] = JSON.stringify(JSON.parse(updates[field]));
          } catch (error) {
            console.error("Error parsing specifications:", error);
            await transaction.rollback();
            return res.status(400).json({
              message: "Invalid JSON format for specifications",
            });
          }
        } else if (typeof updates[field] === "object") {
          // If it's already an object, stringify it
          product[field] = JSON.stringify(updates[field]);
        }
      } else if (updates[field] !== product[field]) {
        // Update other fields if they have changed
        product[field] = updates[field];
      }
    }

    // Handle image update separately
    if (req.file) {
      // If a new image is uploaded, update the image field
      product.image = req.file.path.replace(/\\/g, "/");
    } else if (updates.image === null || updates.image === undefined) {
      // If no new image is uploaded, preserve the existing image
      product.image = product.image;
    }

    await product.save({ transaction });
    await transaction.commit();

    return res.status(200).json({ message: "Updated successfully!" });
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const response = await Product.findAll({
      include: [
        {
          model: ProductHistory,
          required: false,
        },
        {
          model: Category,
        },
      ],
    });

    if (response && response.length > 0) {
      // Convert specifications back to JSON object
      response.forEach((product) => {
        if (product.specifications) {
          product.specifications = JSON.parse(product.specifications);
        }
      });
      return res.status(200).json(response);
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    // Convert specifications back to JSON object
    if (product.specifications) {
      product.specifications = JSON.parse(product.specifications);
    }

    return res.status(200).json(product);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getProductByCategoryId = async (req, res) => {
  try {
    const { id } = req.params; // Category ID
    const { productId } = req.query; // Product ID to exclude

    const products = await Product.findAll({
      where: {
        category_id: id,
        ...(productId && { id: { [Op.ne]: productId } }), // Exclude the product if productId is provided
      },
      include: [
        {
          model: Category,
        },
      ],
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found in this category!" });
    }

    // Convert specifications back to JSON object
    products.forEach((product) => {
      if (product.specifications) {
        product.specifications = JSON.parse(product.specifications);
      }
    });

    return res.status(200).json(products);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};



module.exports = {
  addProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  getProductByCategoryId,
};
