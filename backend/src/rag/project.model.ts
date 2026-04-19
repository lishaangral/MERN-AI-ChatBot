import mongoose, { Schema, Document } from "mongoose";

export interface IRagProject extends Document {
  name: string;
  description?: string;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RagProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: false },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export const RagProject = mongoose.model<IRagProject>("RagProject", RagProjectSchema);
