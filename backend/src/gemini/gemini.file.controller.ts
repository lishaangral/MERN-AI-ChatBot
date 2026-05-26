import { Request, Response } from "express";
import { GeminiFile } from "./gemini.file.model";
import {uploadFileToS3} from "../utils/s3";
import {ExtractedPage, extractTextFromBuffer} from "../rag/extract";
import {deleteFromS3} from "../utils/s3";
import { GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../utils/s3";

export async function uploadGeminiFile(
  req: Request,
  res: Response
) {

  try {

    const file = req.file;

    const { projectId } =
      req.body;

    if (!file) {
      return res.status(400).json({
        error: "File required",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        error: "Project ID required",
      });
    }

    const uploaded =
      await uploadFileToS3(file);

    // const extractedText = await extractTextFromBuffer(file.buffer, file.mimetype);

    let extractedText = "";
    let extractedPages: ExtractedPage[] = [];

    if (!file.mimetype.startsWith("image/")) {

        extractedPages = await extractTextFromBuffer(
            file.buffer,
            file.mimetype
        );

        extractedText =
            extractedPages
                .map((p) => p.text)
                .join("\n\n")
                .trim();
    }
    const doc =
      await GeminiFile.create({
        projectId,
        filename: file.originalname,
        fileUrl: uploaded.fileUrl,
        mimeType: file.mimetype,
        size: file.size,
        extractedText: extractedText || "",
        extractedPages: extractedPages || [],
        isReferencedByRag: false,
        ragDocumentId: null,
      });

    return res.json({
      document: doc,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error:
        "Gemini upload failed",
    });
  }
}



export async function getGeminiFiles(
  req: Request,
  res: Response
) {

  try {

    const { projectId } =
      req.params;

    const files =
      await GeminiFile.find({
        projectId,
      })
      .sort({
        uploadedAt: -1,
      })
      .lean();

    return res.json({
      files,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error:
        "Failed to fetch files",
    });
  }
}

export async function deleteGeminiFile(
  req: Request,
  res: Response
) {

  try {

    const { fileId } = req.params;

    const file = await GeminiFile.findById(fileId);

    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    if (file.fileUrl) {
      await deleteFromS3(
        file.fileUrl
      );
    }

    await GeminiFile.findByIdAndDelete(fileId);

    return res.json({
      success: true,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Failed to delete file",
    });
  }
}

export async function getGeminiPreviewUrl(
  req: Request,
  res: Response
) {

  try {

    const { fileId } = req.params;

    const file = await GeminiFile.findById(fileId);

    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    const split = ".amazonaws.com/";

    const index = file.fileUrl.indexOf(split);

    if (index === -1) {
      throw new Error(
        "Invalid S3 URL"
      );
    }

    const key = file.fileUrl.slice(index + split.length);

    const command =
      new GetObjectCommand({
        Bucket:
          process.env.AWS_BUCKET!,

        Key: key,
      });

    const url =
      await getSignedUrl(
        s3,
        command,
        {
          expiresIn: 3600,
        }
      );

    return res.json({ url });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error:
        "Failed to load preview",
    });
  }
}