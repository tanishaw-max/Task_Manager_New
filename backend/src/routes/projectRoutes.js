import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectControllers.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getProjects)
  .post(createProject);

router.route("/:id")
  .put(updateProject)
  .delete(deleteProject);

export default router;