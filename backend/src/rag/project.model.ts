import mongoose, { Schema, Document } from "mongoose";

export interface IRagProject extends Document {
  name: string;
  description?: string;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
  sourceGeminiProjectId?: string;
}

const RagProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: false },
    description: { type: String, required: false },
    sourceGeminiProjectId: { type: String, default: null },
  },
  { timestamps: true }
);

export const RagProject = mongoose.model<IRagProject>("RagProject", RagProjectSchema);
