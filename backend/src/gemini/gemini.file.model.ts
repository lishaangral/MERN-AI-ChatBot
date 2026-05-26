import mongoose, {
  Schema,
  Document,
} from "mongoose";
import { ExtractedPage } from "../rag/chunking";

export interface IGeminiFile
  extends Document {
  projectId: string;
  filename: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  extractedPages: ExtractedPage[]
  extractedText: string;
  ragDocumentId?: string | null;
  isReferencedByRag: boolean;
}

const GeminiFileSchema =
  new Schema({
    projectId: {
      type: String,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    extractedPages: [
        {
            text: String,
            pageNumber: Number,
        }
    ],
    ragDocumentId: {
        type: String,
        default: null,
    },

    extractedText: {
        type: String,
        default: "",
    },

    isReferencedByRag: {
      type: Boolean,
      default: false,
    },
  });

export const GeminiFile = mongoose.model<IGeminiFile>(
    "GeminiFile",
    GeminiFileSchema
  );