// backend/src/models/Chat.ts
import mongoose from "mongoose";
import { randomUUID } from "crypto";
const MessageSchema = new mongoose.Schema({
    id: { type: String, default: () => randomUUID() },
    role: { type: String, enum: ["user", "model", "system"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const ChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Chat" },
    messages: { type: [MessageSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("Chat", ChatSchema);
