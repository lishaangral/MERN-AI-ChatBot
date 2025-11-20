import mammoth from "mammoth";

/**
 * Safe loader for pdf-parse on ALL environments:
 * - Windows (exports a function)
 * - Linux/Render (exports { default: fn, pdf: fn })
 */
function loadPdfParse(): (buffer: Buffer) => Promise<any> {
  let mod: any;

  try {
    mod = require("pdf-parse");
  } catch (e) {
    throw new Error("Failed to load pdf-parse");
  }

  if (typeof mod === "function") {
    return mod; // Windows/npm standard
  }
  if (typeof mod?.default === "function") {
    return mod.default; // Some bundlers
  }
  if (typeof mod?.pdf === "function") {
    return mod.pdf; // pdf-parse/cjs on Linux
  }

  console.error("pdf-parse export shape:", mod);
  throw new Error("pdf-parse provided no callable function");
}

const pdfParse = loadPdfParse();

export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const lower = filename.toLowerCase();

  // PDF
  if (lower.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data?.text || "";
  }

  // DOCX
  if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  // TXT
  if (lower.endsWith(".txt")) {
    return buffer.toString("utf8");
  }

  return "";
}
