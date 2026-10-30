const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      status: status || 'Pending'
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task', error: error.message });
  }
});

// PUT /api/tasks/:id - Update an existing task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

module.exports = router;

