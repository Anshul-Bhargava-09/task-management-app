const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);

