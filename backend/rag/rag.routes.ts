import express from "express";
import multer from "multer";
import { uploadDocument, ragQuery } from "./rag.controller";

const router = express.Router();
const upload = multer();

router.post("/upload", upload.single("file"), uploadDocument);
router.post("/query", ragQuery);

export default router;
