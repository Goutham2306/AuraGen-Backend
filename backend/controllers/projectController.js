const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const { title, currentJsx } = req.body;

    const userId = req.user.id || req.user._id || req.user.userId;

    const project = new Project({
      userId,
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

exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const projects = await Project.find({ userId }).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    await Project.findOneAndDelete({ _id: req.params.id, userId });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};