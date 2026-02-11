import Task from "../models/Task.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import mongoose from "mongoose";

// Cache for role lookups to avoid repeated DB queries
let roleCache = {};

// Helper: get cached role by title
const getCachedRole = async (roleTitle) => {
  if (!roleCache[roleTitle]) {
    roleCache[roleTitle] = await Role.findOne({ roleTitle }).lean();
  }
  return roleCache[roleTitle];
};

// Helper: get ids of users that a manager can manage (only users with "user" role)
const getManagerVisibleUserIds = async (managerId) => {
  const userRole = await getCachedRole("user");
  if (!userRole) return [new mongoose.Types.ObjectId(managerId)];

  const employees = await User.find({
    roleId: userRole._id,
    isDeleted: false,
    isActive: true,
  }).select("_id").lean();

  return [new mongoose.Types.ObjectId(managerId), ...employees.map(e => e._id)];
};

// GET /api/tasks - list tasks based on role
export const getTasks = async (req, res) => {
  try {
    const role = (req.user.role || "").toLowerCase();

    let filter = { isDeleted: false };

    if (role === "super-admin") {
      
    } else if (role === "manager") {
      const visibleUserIds = await getManagerVisibleUserIds(req.user.id);
      filter.userId = { $in: visibleUserIds };
    } else {
      // normal user: only own tasks
      filter.userId = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate({ path: "userId", select: "username email" })
      .populate({ path: "projectId", select: "name description" })
      .populate({ path: "statusHistory.changedBy", select: "username email" })
      .sort({ createdAt: -1 })
      .lean();

    // Fix admin user display in statusHistory for all tasks
    const fixedTasks = tasks.map(task => {
      if (task.statusHistory) {
        task.statusHistory = task.statusHistory.map(history => {
          if (!history.changedBy && history.changedBy?.toString() === '507f1f77bcf86cd799439011') {
            history.changedBy = { username: 'admin', email: 'admin@taskmanager.com' };
          }
          return history;
        });
      }
      return task;
    });

    return res.json(fixedTasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/tasks - create task
export const createTask = async (req, res) => {
  try {
    const { taskTitle, description, userId, dueDate, projectId } = req.body;

    if (!taskTitle || !description) {
      return res
        .status(400)
        .json({ message: "Task title and description are required" });
    }
    // ❗ Prevent past due dates
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return res.status(400).json({
          message: "Due date cannot be in the past",
        });
      }
    }
    const role = (req.user.role || "").toLowerCase();
    let targetUserId = userId || req.user.id;

    if (role === "user") {
   
      targetUserId = req.user.id;
    } else if (role === "manager") {
      
      if (!targetUserId) targetUserId = req.user.id;

      const targetUser = await User.findById(targetUserId).populate("roleId");
      if (!targetUser || targetUser.isDeleted || !targetUser.isActive) {
        return res.status(400).json({ message: "Target user not found" });
      }

      const targetRole = targetUser.roleId?.roleTitle?.toLowerCase();
      if (targetUser._id.toString() !== req.user.id.toString() && targetRole !== "user") {
        return res
          .status(403)
          .json({ message: "Managers can only assign tasks to users (employees)" });
      }
    }
    // super-admin can assign to any user

    const taskData = {
      taskTitle,
      description,
      userId: targetUserId,
      statusHistory: [{
        status: "pending",
        changedBy: req.user.id,
        changedAt: new Date(),
        note: "Task created",
      }]
    };

    if (dueDate) taskData.dueDate = dueDate;
    if (projectId) taskData.projectId = projectId;

    const task = await Task.create(taskData);

    // Use single populate call for better performance
    const populatedTask = await Task.findById(task._id)
      .populate({ 
        path: "userId", 
        select: "username email" 
      })
      .populate({ 
        path: "projectId", 
        select: "name description" 
      })
      .populate({ 
        path: "statusHistory.changedBy", 
        select: "username email",
        transform: (doc) => {
          if (!doc && task.statusHistory[0]?.changedBy?.toString() === '507f1f77bcf86cd799439011') {
            return { username: 'admin', email: 'admin@taskmanager.com' };
          }
          return doc;
        }
      })
      .lean();

    // Fix admin user display in statusHistory
    if (populatedTask.statusHistory) {
      populatedTask.statusHistory = populatedTask.statusHistory.map(history => {
        if (!history.changedBy && history.changedBy?.toString() === '507f1f77bcf86cd799439011') {
          history.changedBy = { username: 'admin', email: 'admin@taskmanager.com' };
        }
        return history;
      });
    }

    return res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/tasks/:id - update task (status, title, description)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskTitle, description, status, note } = req.body;

    const task = await Task.findById(id);
    if (!task || task.isDeleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    const role = (req.user.role || "").toLowerCase();

    if (role === "user") {
      if (task.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "You can update only your own tasks" });
      }
    } else if (role === "manager") {
      const visibleUserIds = await getManagerVisibleUserIds(req.user.id);
      // Use ObjectId comparison instead of string conversion for better performance
      const taskUserIdStr = task.userId.toString();
      const hasAccess = visibleUserIds.some(id => id.toString() === taskUserIdStr);
      if (!hasAccess) {
        return res.status(403).json({ message: "You cannot update this task" });
      }
    }

    const oldStatus = task.status;
    if (status !== undefined && status !== oldStatus) {
      if (!task.statusHistory) {
        task.statusHistory = [];
      }
      task.statusHistory.push({
        status: status,
        changedBy: req.user.id,
        changedAt: new Date(),
        note: note || `Status changed from ${oldStatus} to ${status}`,
      });
    }

    if (taskTitle !== undefined) task.taskTitle = taskTitle;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();
    
    // Use single populate call for better performance
    const updatedTask = await Task.findById(task._id)
      .populate({ path: "userId", select: "username email" })
      .populate({ path: "projectId", select: "name description" })
      .populate({ path: "statusHistory.changedBy", select: "username email" })
      .lean();
    
    return res.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/tasks/:id - soft delete
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task || task.isDeleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    const role = (req.user.role || "").toLowerCase();

    if (role === "user") {
      if (task.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "You can delete only your own tasks" });
      }
    } else if (role === "manager") {
      const visibleUserIds = await getManagerVisibleUserIds(req.user.id);
      // Use ObjectId comparison for better performance
      const taskUserIdStr = task.userId.toString();
      const hasAccess = visibleUserIds.some(id => id.toString() === taskUserIdStr);
      if (!hasAccess) {
        return res.status(403).json({ message: "You cannot delete this task" });
      }
    }


    task.isDeleted = true;
    await task.save();

    return res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};