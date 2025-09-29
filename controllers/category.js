const db = require("../config/config");
const Category = require("../models/category");
const { Op, fn, col, literal } = require("sequelize");
const pluralize = require("pluralize");
const Product = require("../models/product");
const OrderProducts = require("../models/orderproducts");
const Orders = require("../models/orders");

const addCategory = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { name, isActive } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid category name" });
    }

    const lowerCaseName = name.toLowerCase().trim();

    const singularName = pluralize.singular(lowerCaseName) || lowerCaseName; // Ensure it's a valid string
    const pluralName = pluralize.plural(lowerCaseName) || lowerCaseName; // Ensure it's a valid string
    const noSpaces = lowerCaseName.replace(/\s+/g, ""); // Remove spaces
    const noHyphens = lowerCaseName.replace(/[-_]/g, ""); // Remove hyphens/underscores

    const nameVariations = new Set([
      lowerCaseName,
      singularName,
      pluralName,
      noSpaces,
      noHyphens
    ]);

    // Check if any variation of the name already exists
    const category = await Category.findOne({
      where: {
         [Op.or]: [...nameVariations].map((variation) => ({
          [Op.and]: [
            literal(`LOWER(name) = LOWER('${variation}')`) // Ensures case-insensitive match
          ]
        })),
      },
      transaction,
    });

    if (category) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Name already in use by another category",
      });
    }

    await Category.create(
      {
        name,
        isActive,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      message: "Category created successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const category = await Category.findByPk(req.params.id, { transaction });

    if (!category) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Category not found!",
      });
    }

    const updates = req.body;

    for (const field in updates) {
      if (updates[field] !== category[field]) {
        category[field] = updates[field];
      }
    }

    await category.save({ transaction });
    await transaction.commit();

    return res.status(200).json({ message: "updated successfully!" });
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const response = await Category.findAll();

    if (response && response.length > 0) return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getAllActiveCategory = async (req, res) => {
  try {
    const response = await Category.findAll({
      where: {
        isActive: true,
      },
    });

    if (response && response.length > 0) return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};


const getSalesByCategory = async (req, res) => {
  try {
    const now = new Date();

    // Define date ranges
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);

    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    const last3Months = new Date();
    last3Months.setMonth(now.getMonth() - 3);

    // Fetch total sales grouped by category for completed orders
    const sales = await Category.findAll({
      attributes: [
        "id",
        "name",
        // Sales in last week
        [
          fn(
            "SUM",
            literal(`CASE 
              WHEN \`products->orderproducts->order\`.\`createdAt\` >= '${lastWeek.toISOString()}' 
              THEN \`products->orderproducts\`.\`quantity\` * \`products->orderproducts\`.\`priceAtPurchase\` 
              ELSE 0 
            END`)
          ),
          "sales_last_week"
        ],
        // Sales in last month
        [
          fn(
            "SUM",
            literal(`CASE 
              WHEN \`products->orderproducts->order\`.\`createdAt\` >= '${lastMonth.toISOString()}' 
              THEN \`products->orderproducts\`.\`quantity\` * \`products->orderproducts\`.\`priceAtPurchase\` 
              ELSE 0 
            END`)
          ),
          "sales_last_month"
        ],
        // Sales in last 3 months
        [
          fn(
            "SUM",
            literal(`CASE 
              WHEN \`products->orderproducts->order\`.\`createdAt\` >= '${last3Months.toISOString()}' 
              THEN \`products->orderproducts\`.\`quantity\` * \`products->orderproducts\`.\`priceAtPurchase\` 
              ELSE 0 
            END`)
          ),
          "sales_last_3_months"
        ],
      ],
      include: [
        {
          model: Product,
          required: true,
          include: [
            {
              model: OrderProducts,
              required: true,
              include: [
                {
                  model: Orders,
                  required: true,
                  where: { status: "completed" },
                  attributes: [],
                },
              ],
              attributes: [],
            },
          ],
          attributes: [],
        },
      ],
      group: ["Category.id", "Category.name"],
    });

    
    return res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales by category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  addCategory,
  updateCategory,
  getAllCategory,
  getAllActiveCategory,
  getSalesByCategory
};
