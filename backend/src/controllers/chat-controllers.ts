import { NextFunction, Response, Request } from "express";
import User from "../models/User.js";
import { configureGemini } from "../config/gemini-config.js";

export const generateChatCompletion = async (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) return res.status(401).json({ message: "User not registered or Token Malfunctioned" });

    const chats = user.chats.map(({ role, content }) => ({ role, parts: [{ text: content }] }));
    chats.push({ role: "user", parts: [{ text: message }] });
    user.chats.push({ role: "user", content: message });

    const genAI = configureGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({ history: chats });
    const result = await chat.sendMessage(message);

    const aiMessage = result.response.text();

    user.chats.push({ role: "model", content: aiMessage });
    await user.save();

    return res.status(200).json({ chats: user.chats });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
