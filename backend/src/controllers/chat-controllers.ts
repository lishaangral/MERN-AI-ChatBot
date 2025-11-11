// backend/src/controllers/chat-controllers.ts
import { NextFunction, Response, Request } from "express";
import Chat from "../models/Chat";
import mongoose from "mongoose";
import { configureGemini } from "../config/gemini-config";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const { message, chatId } = req.body;

  try {
    const userId = res.locals.jwtData?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // find or create chat
    let chat = null;
    if (chatId) {
      try {
        const _id = new mongoose.Types.ObjectId(chatId);
        chat = await Chat.findOne({
          _id,
          userId: new mongoose.Types.ObjectId(userId),
        });
      } catch {
        chat = null;
      }
    }

    if (!chat) {
      chat = await Chat.create({
        userId: new mongoose.Types.ObjectId(userId),
        title: "New Chat",
        messages: [],
      });
    }

    // clean and sanitize the message
    const cleanMessage = String(message).trim().replace(/\s+/g, " ");

    // push user message only if it's new
    const last = chat.messages[chat.messages.length - 1];
    if (!last || last.content !== cleanMessage || last.role !== "user") {
      chat.messages.push({ role: "user", content: cleanMessage });
      await chat.save();
    }

    // deduplicate any repeated messages
    const uniqueMessages: any[] = [];
    for (const m of chat.messages) {
      const prev = uniqueMessages[uniqueMessages.length - 1];
      if (!prev || prev.content !== m.content || prev.role !== m.role) {
        uniqueMessages.push(m);
      }
    }

    // build history excluding the last user message
    const previous = uniqueMessages
      .filter((m, i) => i < uniqueMessages.length - 1)
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

    // call Gemini 2.5
    const genAI = configureGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // send only one clean user message with full history
    const result = await model.generateContent({
      contents:
        previous.length > 0
          ? [
              ...previous,
              { role: "user", parts: [{ text: cleanMessage }] },
            ]
          : [{ role: "user", parts: [{ text: cleanMessage }] }],
    });

    // extract Gemini reply
    let aiMessage = "";
    try {
      aiMessage = result?.response?.text() || "";
    } catch (ex) {
      console.warn("Could not parse Gemini response:", ex);
    }

    // save model response
    chat.messages.push({ role: "model", content: aiMessage });
    if (!chat.title || chat.title === "New Chat") {
      chat.title =
        cleanMessage.length > 30
          ? cleanMessage.slice(0, 30) + "..."
          : cleanMessage;
    }
    await chat.save();

    // normalize response
    const normalized = {
      id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
    };

    return res.status(200).json({ chat: normalized });
  } catch (error: any) {
    console.error("generateChatCompletion error:", error?.response || error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// remaining CRUD functions (unchanged)

export const createChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals.jwtData?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chat = await Chat.create({
      userId: new mongoose.Types.ObjectId(userId),
      title: "New Chat",
      messages: [],
    });

    return res.status(201).json({
      chat: { id: chat._id.toString(), title: chat.title, messages: chat.messages },
    });
  } catch (err: any) {
    console.error("createChat error:", err);
    return res.status(500).json({ message: "Unable to create chat" });
  }
};

export const getAllChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals.jwtData?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chats = await Chat.find({ userId }).sort({ createdAt: -1 }).lean();
    const normalized = chats.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      messages: c.messages || [],
    }));
    return res.status(200).json({ chats: normalized });
  } catch (err: any) {
    console.error("getAllChats error:", err);
    return res.status(500).json({ message: "Unable to fetch chats" });
  }
};

export const getChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals.jwtData?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chatId = req.params.id;
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    return res.status(200).json({
      chat: { id: chat._id.toString(), title: chat.title, messages: chat.messages },
    });
  } catch (err: any) {
    console.error("getChat error:", err);
    return res.status(500).json({ message: "Unable to fetch chat" });
  }
};

export const deleteChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals.jwtData?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chatId = req.params.id;
    const deleted = await Chat.findOneAndDelete({ _id: chatId, userId });
    if (!deleted)
      return res
        .status(404)
        .json({ message: "Chat not found or not owned by user" });

    return res.status(200).json({ message: "OK" });
  } catch (err: any) {
    console.error("deleteChat error:", err);
    return res.status(500).json({ message: "Unable to delete chat" });
  }
};

export const deleteAllChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals.jwtData?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await Chat.deleteMany({ userId });
    return res.status(200).json({ message: "OK" });
  } catch (err: any) {
    console.error("deleteAllChats error:", err);
    return res.status(500).json({ message: "Unable to delete chats" });
  }
};
