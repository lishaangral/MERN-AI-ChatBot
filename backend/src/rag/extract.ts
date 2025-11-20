import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Extract text using pdfjs-dist (Render-compatible)

async function extractPdfText(buffer: Buffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n";
  }

  return fullText;
}


//  Main extraction function
export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }

  if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  if (lower.endsWith(".txt")) {
    return buffer.toString("utf8");
  }

  return "";
}
