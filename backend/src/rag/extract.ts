// backend/src/rag/extract.ts
import fs from "fs";
import pdfParse from "pdf-parse"; // keep using pdf-parse
import mammoth from "mammoth";

export async function extractTextFromBuffer(buffer: Buffer, filename: string, mimeType?: string): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const data = await pdfParse(buffer);
    return data.text || "";
  } else if (ext === "docx") {
    const res = await mammoth.extractRawText({ buffer });
    return res.value || "";
  } else if (ext === "txt") {
    return buffer.toString("utf8");
  } else {
    // default attempt to parse PDF
    const data = await pdfParse(buffer);
    return data.text || "";
  }
}
