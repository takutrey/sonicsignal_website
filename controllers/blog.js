const db = require("../config/config"); 
const Blog = require("../models/blog"); 
const { Op, literal } = require("sequelize");
const pluralize = require("pluralize");
const blogCategory = require("../models/blogCategory");


const addBlog = async(req, res) => {
    const transaction = await db.transaction();
    try {
        const {
            title, 
            slug, 
            content, 
            tags, 
            isPublished, 
            blogCategoryId
        } = req.body;

        if (!title || typeof title !== "string") {
            return res.status(400).json({ message: "Invalid blog title" });
        }

        const lowerCaseName = title.toLowerCase().trim();

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

 

    const blog = await Blog.findOne({
        where: {
          blogCategoryId,
          title,
          [Op.or]: [...nameVariations].map((variation) => ({
            [Op.and]: [literal(`LOWER(title) = LOWER('${variation}')`)],
          })),
        },
        transaction,
      });

      const formattedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? JSON.parse(tags)
        : [];


    if (blog) {
        await transaction.rollback();
        return res.status(400).json({
          message: "A blog with that title and category already exists",
        });
    }

    function formatSlug(title) {
        return title
          .toLowerCase() // Convert title to lowercase
          .replace(/[^\w\s-]/g, '') // Remove all non-alphanumeric characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
    }

    const slugs = formatSlug(title);

    // Check if the slug already exists and append a number if necessary
    let uniqueSlug = slugs;
    let slugExists = await Blog.findOne({ where: { slug: uniqueSlug } });
    let counter = 1;
    while (slugExists) {
      uniqueSlug = `${slug}-${counter}`;
      slugExists = await Blog.findOne({ where: { slug: uniqueSlug } });
      counter++;
    }
    
    const addedBlogs = await Blog.create({
        title, 
        slug: uniqueSlug, 
        content, 
        coverImage: req.file?.path.replace(/\\/g, "/"), 
        tags: formattedTags, 
        isPublished, 
        blogCategoryId
    }, {transaction});

    console.log("aDDED BLOG", addedBlogs);

    await transaction.commit();
    res.status(200).json({
        message: "Blog added successfully",
        data: addedBlogs
      });
        
    } catch (error) {
        await transaction.rollback();
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
        
    }
}

const updateBlog = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const blog = await Blog.findByPk(req.params.id, { transaction });

    if (!blog) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Blog not found!",
      });
    }

    const updates = req.body;
    console.log("Updates", updates);

    // Update fields if they have changed
    for (const field in updates) {
       if (updates[field] !== blog[field]) {
        // Update other fields if they have changed
        blog[field] = updates[field];
      }
    }

    // Handle image update separately
    if (req.file) {
      blog.coverImage = req.file.path.replace(/\\/g, "/");
    } else if (updates.coverImage !== undefined) {
      blog.coverImage = updates.coverImage;
    }

    await blog.save({ transaction });
    await transaction.commit();

    return res.status(200).json({ message: "Updated successfully!", data: blog });
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getAllBlogs = async(req, res) => {
    try {
        const allblogs = await Blog.findAll({
            include: [
                {
                    model: blogCategory, 
                    required: true
                }
            ]
        }); 


        return res.status(200).json(allblogs);
        
    } catch (error) {
        return res
      .status(500)
      .json({ message: "Internal server error: " + error.message
       });
        
    }
} 

const getBlogById = async(req, res) => {
    try {
        const singleBlog = await Blog.findByPk(req.params.id, {
            include: [
                {
                    model: blogCategory
                }
            ]
        });

        if(!singleBlog) {
            return res.status(404).json({ message: "Blog not found!" });
        }

        return res.status(200).json(singleBlog);
        
    } catch (error) {
        return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
        
    }
}

const getBlogsByCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const {blogId} = req.query;// Category ID
  
      const blogs = await Blog.findAll({
        where: {
          blogCategoryId: id,
          ...(blogId && { id: { [Op.ne]: blogId } }), 
        },
        include: [
          {
            model: blogCategory,
          },
        ],
      });
  
      if (!blogs || blogs.length === 0) {
        return res.status(404).json({ message: "No blogs found in this category!" });
      }
  
  
      return res.status(200).json(blogs);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error: " + error.message });
    }
  };

  module.exports = {
    getAllBlogs, getBlogById, getBlogsByCategory, updateBlog, addBlog
  }