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

    res.json({ documents: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
}

export async function deleteDocument(req: Request, res: Response) {
  try {
    const { docId } = req.params;

    const docCol = getRagDocumentsCollection();
    const chunkCol = getRagCollection();

    // Delete document entry
    await docCol.deleteOne({ docId });

    // Delete chunks belonging to this doc
    await chunkCol.deleteMany({ docId });

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete document" });
  }
}
