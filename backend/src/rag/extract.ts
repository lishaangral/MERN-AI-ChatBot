/**
 * extract.ts (Render-compatible)
 * Extracts text from PDF, DOCX, TXT buffers safely
 */
export type ExtractedPage = {
  text: string;
  pageNumber: number;
};

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";

// Extract PDF using pdfjs-dist with Uint8Array (Render fix)
export async function extractPdfText(buffer: Buffer): Promise<ExtractedPage[]> {
  try {
    const uint8 = new Uint8Array(buffer); // FIX for Render

    const loadingTask = pdfjsLib.getDocument({ data: uint8 });
    const pdf = await loadingTask.promise;

    const pages: ExtractedPage[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(" ") + "\n";
      pages.push({ text, pageNumber: pageNum });
    }

    return pages;
  } catch (err) {
    console.error("PDF EXTRACT ERROR:", err);
    return [];
  }
}

// Extract DOCX using mammoth
export async function extractDocxText(buffer: Buffer): Promise<ExtractedPage[]> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return [{ text: result.value || "", pageNumber: 1 }]; // mammoth doesn't do pages, so we return all text as one page
  } catch (err) {
    console.error("DOCX EXTRACT ERROR:", err);
    return [];
  }
}
// Extract TXT
export function extractTxtText(buffer: Buffer): ExtractedPage[] {
  try {
    return [{ text: buffer.toString("utf-8"), pageNumber: 1 }];
  } catch {
    return [];
  }
}

// Smart choose extractor
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractedPage[]> {
  mimeType = mimeType.toLowerCase();

  if (mimeType.includes("pdf")) return extractPdfText(buffer);
  if (mimeType.includes("word") || mimeType.includes("docx")) return extractDocxText(buffer);
  if (mimeType.includes("text")) return extractTxtText(buffer);

  return [];
}
