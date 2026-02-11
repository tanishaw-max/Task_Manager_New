import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getProjects = async (req, res) => {
  try {
    const role = (req.user.role || "").toLowerCase();
    let filter = { isDeleted: false };

    if (role === "user") {
      filter.members = req.user.id;
    } else if (role === "manager") {
      filter.$or = [
        { createdBy: req.user.id },
        { members: req.user.id }
      ];
    }

    const projects = await Project.find(filter)
      .populate({ path: "members", select: "username email role" })
      .populate({ path: "createdBy", select: "username email" })
      .populate({ 
        path: "tasks", 
        match: { isDeleted: false },
        select: "taskTitle status userId",
        populate: { path: "userId", select: "username" }
      })
      .sort({ createdAt: -1 });

    return res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const role = (req.user.role || "").toLowerCase();

    if (role === "user") {
      return res.status(403).json({ message: "Only admins and managers can create projects" });
    }

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      members: members || [],
      createdBy: req.user.id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate({ path: "members", select: "username email role" })
      .populate({ path: "createdBy", select: "username email" });

    return res.status(201).json(populatedProject);
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members } = req.body;
    const role = (req.user.role || "").toLowerCase();

    const project = await Project.findById(id);
    if (!project || project.isDeleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (role === "user") {
      return res.status(403).json({ message: "Only admins and managers can update projects" });
    }

    if (role === "manager" && project.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You can only update your own projects" });
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (members !== undefined) project.members = members;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate({ path: "members", select: "username email role" })
      .populate({ path: "createdBy", select: "username email" });

    return res.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const role = (req.user.role || "").toLowerCase();

    const project = await Project.findById(id);
    if (!project || project.isDeleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (role === "user") {
      return res.status(403).json({ message: "Only admins and managers can delete projects" });
    }

    if (role === "manager" && project.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You can only delete your own projects" });
    }

    project.isDeleted = true;
    await project.save();

    return res.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};