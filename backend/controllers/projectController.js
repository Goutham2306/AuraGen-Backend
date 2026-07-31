const Project = require('../models/Project');

// Save / Create Project
exports.createProject = async (req, res) => {
  try {
    const { title, currentJsx } = req.body;
    const project = new Project({
      userId: req.user.userId,
      title,
      currentJsx,
      history: [{ prompt: 'Initial Creation', jsx: currentJsx }]
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Projects for User
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};