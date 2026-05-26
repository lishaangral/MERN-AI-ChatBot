import express from "express";
import { createProject, listProjects, deleteProject, getProjectById } from "./project.controller";

const router = express.Router();

router.post("/project", createProject);         // POST /api/v1/rag/project
router.get("/project/all", listProjects);       // GET  /api/v1/rag/project/all
router.get("/project/:id", getProjectById);         // GET  /api/v1/rag/project/:id
router.delete("/project/:id", deleteProject);   // DELETE /api/v1/rag/project/:id

export default router;
