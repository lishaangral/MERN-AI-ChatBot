import express from "express";

import multer from "multer";

import {
  uploadGeminiFile,
  getGeminiFiles,
  deleteGeminiFile,
  getGeminiPreviewUrl,
} from "./gemini.file.controller";

const router =
  express.Router();

const upload = multer({storage: multer.memoryStorage()});
router.post("/upload", upload.single("file"), uploadGeminiFile);
router.get("/project/:projectId/files", getGeminiFiles);
router.delete("/file/:fileId", deleteGeminiFile);
router.get("/file/:fileId/preview", getGeminiPreviewUrl);

export default router;