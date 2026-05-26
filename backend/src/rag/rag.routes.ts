import express from "express";
import multer from "multer";
import { uploadDocument, ragQuery } from "./rag.controller";
import { getDocumentsInProject, deleteDocument } from "./rag.documents.controller";
import { getDocumentPreviewUrl } from "./rag.preview.controller";


const router = express.Router();
const upload = multer();

// We explicitly type the handlers as "any" to bypass Express TS override problem.
router.post("/upload", upload.single("file") as any, uploadDocument as any);
router.post("/query", ragQuery as any);
router.get("/project/:projectId/documents", getDocumentsInProject as any);
router.delete("/document/:docId", deleteDocument as any);
router.get("/document/:docId/preview", getDocumentPreviewUrl as any);

export default router;
