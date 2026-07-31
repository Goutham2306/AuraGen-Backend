const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createProject, getUserProjects, deleteProject } = require('../controllers/projectController');

router.post('/', auth, createProject);
router.get('/', auth, getUserProjects);
router.delete('/:id', auth, deleteProject);

module.exports = router;