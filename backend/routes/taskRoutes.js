const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, deleteAllTasks } = require('../controllers/taskController');

router.get('/', getTasks);
router.post('/', createTask);
router.delete('/', deleteAllTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
