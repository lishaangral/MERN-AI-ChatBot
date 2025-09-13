// backend/src/controllers/chat-controllers.ts (replace generateChatCompletion)
import { NextFunction, Response, Request } from "express";
import Chat from "../models/Chat";
import { configureGemini } from "../config/gemini-config";

export const generateChatCompletion = async (req: Request, res: Response, next: NextFunction) => {
  const { message, chatId } = req.body;
  try {
    const userId = res.locals.jwtData?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // find or create chat
    let chat = chatId ? await Chat.findOne({ _id: chatId, userId }) : null;
    if (!chat) {
      chat = await Chat.create({ userId, title: "New Chat", messages: [] });
    }

    // push user message
    chat.messages.push({ role: "user", content: message });
    await chat.save();

    // map history to the Gemini format your configureGemini expects
    const history = chat.messages.map(m => ({ role: m.role === "model" ? "model" : m.role, parts: [{ text: m.content }] }));

    const genAI = configureGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const gChat = model.startChat({ history });
    const result = await gChat.sendMessage(message);

    // Extract the assistant text robustly:
    let aiMessage = "";
    try {
      const r: any = result;
      if (r?.response && typeof r.response.text === "function") {
        aiMessage = r.response.text();
      } else if (Array.isArray(r?.output) && r.output.length > 0) {
        // fallback if SDK returns output blocks
        aiMessage = (r.output[0].content?.parts && r.output[0].content.parts[0]) || "";
      } else if (r?.candidates && r.candidates[0]) {
        aiMessage = r.candidates[0].content?.parts?.[0] || "";
      } else if (r?.outputText) {
        aiMessage = r.outputText;
      } else {
        aiMessage = JSON.stringify(r).slice(0, 1000);
      }
    } catch (ex) {
      console.warn("Could not parse Gemini r:", ex);
      aiMessage = "";
    }

    // save model response
    chat.messages.push({ role: "model", content: aiMessage });
    if (!chat.title || chat.title === "New Chat") {
      chat.title = message.length > 30 ? message.slice(0, 30) + "..." : message;
    }
    await chat.save();

    return res.status(200).json({ chat });
  } catch (error) {
    console.error("generateChatCompletion error:", (error as any)?.response || error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
