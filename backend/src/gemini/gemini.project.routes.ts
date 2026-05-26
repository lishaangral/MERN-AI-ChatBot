import express from "express";
import {
  createGeminiProject,
  listGeminiProjects,
  getGeminiProject,
  deleteGeminiProject,
  plugToRag,
  plugRagChat,
} from "./gemini.project.controller";

const router = express.Router();

router.post("/project", createGeminiProject);
router.get("/project/all", listGeminiProjects);
router.get("/project/:projectId", getGeminiProject);
router.delete("/project/:projectId", deleteGeminiProject);
router.post("/project/:projectId/plug-rag", plugToRag);
router.post("/project/plug-rag-chat", plugRagChat);

export default router;