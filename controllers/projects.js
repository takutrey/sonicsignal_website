const db = require("../config/config"); 
const pluralize = require("pluralize"); 
const {Op, literal} = require("sequelize"); 
const Projects = require("../models/projects");


const addProject = async(req, res) => {
    const transaction = await db.transaction(); 

    try {
        const {
            title, 
            project_status, 
            project_description, 

        } = req.body;

        await Projects.create({
            title, 
            project_description, 
            project_status, 
            image: req.file?.path.replace(/\\/g, "/"),
        }, {transaction});

        await transaction.commit(); 

        res.status(200).json({
            message: "Project added successfully"
        });
        
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            message: "Internal server error: " + error.message,
        });
        
    }
}

const updateProject = async(req, res) => {
    const transaction =  await db.transaction(); 

    try {
        const project = await Projects.findByPk(req.params.id, { transaction});

        if(!project) {
            await transaction.rollback(); 
            return res.status(404).json({
                message: "Project not found!",
            });

        }

        const updates = req.body; 

        for(const field in updates){
            if (updates[field] !== project[field]) {
                // Update other fields if they have changed
                project[field] = updates[field];
            }

        }
       

         // Handle image update separately
        if (req.file) {
        // If a new image is uploaded, update the image field
            project.image = req.file.path.replace(/\\/g, "/");
          } else if (updates.image === null || updates.image === undefined) {
        // If no new image is uploaded, preserve the existing image
            project.image = project.image;
        }


        await project.save({transaction}); 
        await transaction.commit();

        return res.status(200).json({ message: "Updated successfully!" });
 
    } catch (error) {

        await transaction.rollback();
        return res
          .status(500)
          .json({ message: "Internal server error: " + error.message });
      
        
    }
}

const getAllProjects = async(req, res) => {
    try {
        const response = await Projects.findAll();
        if (response && response.length > 0) return res.status(200).json(response);
        
    } catch (error) {
        return res
        .status(500)
        .json({ message: "Internal server error: " + error.message });
        
    }

}

module.exports = {addProject, updateProject, getAllProjects};