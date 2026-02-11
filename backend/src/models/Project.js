import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for tasks
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
});

export default mongoose.model("Project", projectSchema);