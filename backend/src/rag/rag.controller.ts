import { Request, Response } from "express";
import { extractTextFromBuffer } from "./extract";
import { chunkText } from "./chunking";
import {
  storeChunks,
  searchRelevantChunks,
  generateAnswerFromChunks
} from "./rag.service";
import { FileRequest } from "./rag.types";
import { v4 as uuid } from "uuid";

// UPLOAD DOCUMENT
export async function uploadDocument(req: FileRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { projectId } = req.body;
    const docId = uuid();

    const text = await extractTextFromBuffer(req.file.buffer, req.file.originalname);
    const chunks = chunkText(text);

    await storeChunks({
      projectId,
      docId,
      chunks,
      source: req.file.originalname
    });

    res.json({
      message: "Document processed successfully",
      docId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Document upload failed" });
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
