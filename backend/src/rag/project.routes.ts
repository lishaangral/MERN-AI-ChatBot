import express from "express";
import { createProject, listProjects, deleteProject } from "./project.controller";

const router = express.Router();

router.post("/project", createProject);         // POST /api/v1/rag/project
router.get("/project/all", listProjects);       // GET  /api/v1/rag/project/all
router.delete("/project/:id", deleteProject);   // DELETE /api/v1/rag/project/:id

export default router;
