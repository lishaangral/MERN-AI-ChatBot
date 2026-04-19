import { Request, Response } from "express";
import { extractTextFromBuffer } from "./extract";
import { chunkText } from "./chunking";
import {
  storeChunks,
  searchRelevantChunks,
  generateAnswerFromChunks,
  storeDocumentMetadata
} from "./rag.service";
import { FileRequest } from "./rag.types";
import { v4 as uuid } from "uuid";
import { uploadFileToS3 } from "../utils/s3";

// UPLOAD DOCUMENT
export async function uploadDocument(req: FileRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { projectId } = req.body;
    const docId = uuid();

    const text = await extractTextFromBuffer(
      req.file.buffer,
      req.file.mimetype
    );

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Failed to extract text" });
    }
    const chunks = chunkText(text);

    if (!chunks || chunks.length === 0) {
      return res.status(400).json({ error: "Failed to chunk text" });
    }

    await storeChunks({
      projectId,
      docId,
      chunks,
      source: req.file.originalname
    });

    const {fileUrl, key} = await uploadFileToS3(req.file);

    await storeDocumentMetadata({
      projectId,
      docId,
      filename: req.file.originalname,
      fileUrl,
      size: req.file.size,
      chunkCount: chunks.length,
    });

    res.json({
      message: "Document processed successfully",
      docId,
      fileUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Document upload failed. File not processed." });
  }
}

// RAG QUERY
export async function ragQuery(req: FileRequest, res: Response) {
  try {
    const { projectId, query } = req.body;

    const chunkDocs = await searchRelevantChunks(projectId, query);

    const chunkTexts = chunkDocs.map((doc) => doc.chunk);

    const answer = await generateAnswerFromChunks(chunkTexts, query);

    res.json({
      answer,
      sources: chunkDocs.map((d) => d.metadata),
      chunks: chunkTexts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "RAG query failed" });
  }
}
