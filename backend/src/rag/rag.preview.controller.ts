import { Request, Response } from "express";

import { getRagDocumentsCollection }
from "./rag.documents.db";

import { generateSignedPreviewUrl } from "../utils/s3";

export async function getDocumentPreviewUrl(
  req: Request,
  res: Response
) {
  try {

    const { docId } = req.params;

    const col = getRagDocumentsCollection();

    const doc = await col.findOne({ docId });

    if (!doc) {
      return res.status(404).json({
        error: "Document not found",
      });
    }

    const url = await generateSignedPreviewUrl(doc.fileUrl);

    return res.json({ url });

  } catch (err) {

    console.error("PREVIEW URL ERROR:", err);

    return res.status(500).json({
      error: "Failed to generate preview URL",
    });
  }
}