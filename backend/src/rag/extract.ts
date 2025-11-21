/**
 * extract.ts (Render-compatible)
 * Extracts text from PDF, DOCX, TXT buffers safely
 */

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";

// Extract PDF using pdfjs-dist with Uint8Array (Render fix)
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const uint8 = new Uint8Array(buffer); // FIX for Render

    const loadingTask = pdfjsLib.getDocument({ data: uint8 });
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
    }

    return fullText;
  } catch (err) {
    console.error("PDF EXTRACT ERROR:", err);
    return "";
  }
}

// Extract DOCX using mammoth
export async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (err) {
    console.error("DOCX EXTRACT ERROR:", err);
    return "";
  }
}
// Extract TXT
export function extractTxtText(buffer: Buffer): string {
  try {
    return buffer.toString("utf-8");
  } catch {
    return "";
  }
}

// Smart choose extractor
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  mimeType = mimeType.toLowerCase();

  if (mimeType.includes("pdf")) return extractPdfText(buffer);
  if (mimeType.includes("word") || mimeType.includes("docx")) return extractDocxText(buffer);
  if (mimeType.includes("text")) return extractTxtText(buffer);

  return "";
}
