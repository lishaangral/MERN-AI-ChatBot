// backend/src/rag/chat.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  citations?: ICitation[];
}

export interface ICitation {
  chunk?: string;
  source?: string;
  pageNumber?: number | null;
  preview?: string;
  docId?: string;
  score?: number;
}


export interface IChat extends Document {
  projectId?: string;                 // for project chats
  workspaceType: "rag" | "gemini"; 
  chatType: "project" | "standalone" | "plugged";   // to differentiate between project-level and user-level chats  
  linkedProjectId?: string;              // to link standalone/gemini chats to a project if needed
  title: string;
  userId?: string;                    // for user-specific chats
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  sourceChatId?: string;
  snapshotTimestamp?: Date;
  memorySummary?: string;
}

const CitationSchema = new Schema(
  {
    chunk: { type: String },
    source: { type: String },
    pageNumber: { type: Number },
    preview: { type: String },
    docId: { type: String },
    score: { type: Number },
  },

  { _id: false }
);

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  citations: { type: [CitationSchema], default: []},
});

const ChatSchema = new Schema<IChat>(
  {
    projectId: { type: String },
    userId: { type: String },
    workspaceType: { type: String, enum: ["rag", "gemini"], required: true },
    chatType: { type: String, enum: ["project", "standalone", "plugged"], required: true },
    linkedProjectId: { type: String },
    sourceChatId: { type: String },
    snapshotTimestamp: { type: Date },
    memorySummary: {
      type: String,
      default: "",
    },
    title: { type: String, default: "New Chat" },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

export const Chat = mongoose.model("RagChat", ChatSchema, "ragchats");