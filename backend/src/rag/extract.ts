import mammoth from "mammoth";

// pdf-parse has inconsistent exports across environments (Windows vs Linux)
let pdfParse: any;
try {
  // CommonJS export (Render Linux)
  pdfParse = require("pdf-parse");
  if (pdfParse.pdf) pdfParse = pdfParse.pdf; // fallback if wrapped
} catch {
  throw new Error("Failed to load pdf-parse");
}

export async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.toLowerCase();

  // PDF
  if (ext.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data?.text || "";
  }

  // DOCX
  if (ext.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  // TXT
  if (ext.endsWith(".txt")) {
    return buffer.toString("utf8");
  }

  return ""; // unsupported type
}
