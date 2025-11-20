import { Request, Response } from "express";
import { RagChat } from "./rag.chat.model";
import { generateAnswerFromChunks, searchRelevantChunks } from "./rag.service";

// create chat
export async function createRagChat(req: Request, res: Response) {
  const { projectId, title } = req.body;
  const chat = await RagChat.create({ projectId, title, messages: [] });
  res.json({ chat });
}

// list chats for project
export async function listRagChats(req: Request, res: Response) {
  const { projectId } = req.params;
  const chats = await RagChat.find({ projectId }).sort({ updatedAt: -1 }).lean();
  res.json({ chats });
}

// delete chat
export async function deleteRagChat(req: Request, res: Response) {
  const { chatId } = req.params;

  try {
    const deleted = await RagChat.findByIdAndDelete(chatId);
    if (!deleted) return res.status(404).json({ message: "Chat not found" });

    return res.json({ message: "Chat deleted", chatId });
  } catch (err) {
    console.error("deleteChat error", err);
    return res.status(500).json({ message: "Failed to delete chat" });
  }
}

// get chat
export async function getRagChat(req: Request, res: Response) {
  const { chatId } = req.params;
  const chat = await RagChat.findById(chatId).lean();
  res.json({ chat });
}

// send message (user prompt) -> generate answer + store both in chat
export async function sendRagMessage(req: Request, res: Response) {
  const { chatId, projectId, message } = req.body;

  // find relevant chunks
  const chunkDocs = await searchRelevantChunks(projectId, message);
  const chunkTexts = chunkDocs.map((d) => d.chunk);

  // generate answer
  const answer = await generateAnswerFromChunks(chunkTexts, message);

  // store to DB
  const msgUser = { role: "user", content: message, createdAt: new Date() };
  const msgBot = { role: "assistant", content: answer, createdAt: new Date() };

  let chat;
  if (chatId) {
    chat = await RagChat.findByIdAndUpdate(
      chatId,
      { $push: { messages: msgUser } },
      { new: true }
    );

    // append bot message too
    await RagChat.findByIdAndUpdate(chatId, { $push: { messages: msgBot } });
    chat = await RagChat.findById(chatId).lean();
  } else {
    // create a new chat for the project
    chat = await RagChat.create({
      projectId,
      title: message.length > 30 ? message.slice(0, 30) + "..." : message,
      messages: [msgUser, msgBot],
    });
  }

  res.json({ chat, answer });
}
