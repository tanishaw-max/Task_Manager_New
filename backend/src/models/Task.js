import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: "",
  },
}, { _id: false });

const taskSchema = new mongoose.Schema(
  {
    taskTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    dueDate: {
      type: Date,
      required: false,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Middleware to track status changes
taskSchema.pre("save", async function (next) {
  if (this.isModified("status") && !this.isNew) {
    // Add to history if status changed
    if (!this.statusHistory) {
      this.statusHistory = [];
    }
    // Get the user who made the change from the context (we'll pass it in the route)
    // For now, we'll track it when updating
  }
  next();
});

export default mongoose.model("Task", taskSchema);

