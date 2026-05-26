import { Request, Response } from "express";
import { getRagDocumentsCollection } from "./rag.documents.db";
import { getRagCollection } from "./rag.db";
import { ObjectId } from "mongodb";

export async function getDocumentsInProject(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const col = getRagDocumentsCollection();

    const docs = await col
      .find({ projectId })
      .sort({ uploadedAt: -1 })
      .toArray();

    return res.json({
      documents: docs.map((d) => ({
        docId: d.docId,
        filename: d.filename,
        fileUrl: d.fileUrl,
        uploadedAt: d.uploadedAt,
        size: d.size,
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
}

import { deleteFromS3 } from "../utils/s3"; // if exists
import { SignalZero } from "lucide-react";

export async function deleteDocument(req: Request, res: Response) {
  try {
    const { docId } = req.params;

    const docCol = getRagDocumentsCollection();
    const chunkCol = getRagCollection();

    const doc = await docCol.findOne({ docId });

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // delete chunks
    await chunkCol.deleteMany({ docId });

    // delete metadata
    await docCol.deleteOne({ docId });

    // delete from S3
    if (doc.fileUrl) {
      await deleteFromS3(doc.fileUrl);
    }

    return res.json({ success: true, message: "Document deleted successfully" });

  } catch (err) {
    console.error("DELETE DOC ERROR:", err);
    return res.status(500).json({ error: "Failed to delete document" });
  }
}
