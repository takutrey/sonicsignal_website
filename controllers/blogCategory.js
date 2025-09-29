const db = require("../config/config"); 
const blogCategory = require("../models/blogCategory"); 
const Blog = require("../models/blog"); 
const pluralize = require("pluralize");
const { Op, literal } = require("sequelize");

const addBlogCategory = async(req, res) => {
    const transaction = await db.transaction(); 
    try {
        const {name} = req.body; 

        if(!name || typeof name !== "string"){
            return res.status(400).json({
                message: "Invalid Category Name"
            });
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

            const blogcategory = await blogCategory.findOne({
                where: {
                         [Op.or]: [...nameVariations].map((variation) => ({
                          [Op.and]: [
                            literal(`LOWER(name) = LOWER('${variation}')`) // Ensures case-insensitive match
                          ]
                        })),
                      },
                      transaction,
            }); 

            if(blogcategory) {
                await transaction.rollback(); 
                return res.status(400).json({
                    message: "Category Exists"
                });
            }

            await blogCategory.create({
                name
            }, transaction); 

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
}

const updateBlogCategory = async(req, res) => {
    const transaction = await db.transaction(); 

    try {
        const categoryblog = await blogCategory.findByPk(req.params.id, {transaction}); 

        if(!categoryblog){
            await transaction.rollback(); 
            return res.status(404).json({
                message: "Category not found"
            })
        }

        const updates = req.body; 

        for(const field in updates){
            if(updates[field] !== categoryblog[field]){
                categoryblog[field] = updates[field];
            }
        }

        await categoryblog.save({transaction}); 
        await transaction.commit();
        return res.status(200).json({ message: "updated successfully!" });

        
    } catch (error) {
        await transaction.rollback();
        return res
          .status(500)
          .json({ message: "Internal server error: " + error.message 

          });
      
        
    }
}

const getAllBlogCategory = async (req, res) => {
    try {
      const response = await blogCategory.findAll();
  
      if (response && response.length > 0) return res.status(200).json(response);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error: " + error.message });
    }
};

module.exports = { getAllBlogCategory, addBlogCategory, updateBlogCategory};