import mongoose, { Schema, Document } from "mongoose";

export interface IRagChat extends Document {
  projectId: string;
  title: string;
  messages: { role: string; content: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const RagChatSchema = new Schema(
  {
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    messages: { type: Array, default: [] },
  },
  { timestamps: true }
);

export const RagChat = mongoose.model<IRagChat>("RagChat", RagChatSchema);
