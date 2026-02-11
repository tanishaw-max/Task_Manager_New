import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/taskControllers.js";

const router = express.Router();

// GET /api/tasks - list tasks based on role
router.get("/", protect, getTasks);

// POST /api/tasks - create task
router.post("/", protect, createTask);

// PUT /api/tasks/:id - update task (status, title, description)
router.put("/:id", protect, updateTask);

// DELETE /api/tasks/:id - soft delete
router.delete("/:id", protect, deleteTask);

export default router;

