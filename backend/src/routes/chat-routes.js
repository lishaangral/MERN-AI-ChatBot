// backend/src/routes/chat-routes.ts
import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";
import { 
// createChat,
// getAllChats,
// getChat,
// deleteChat,
// deleteAllChats,
generateChatCompletion, } from "../controllers/chat-controllers.js";
const chatRoutes = Router();
// Create a new empty chat
// chatRoutes.post("/create", verifyToken, createChat);
// Send message to Gemini (optionally supply chatId). Keeps /new for compatibility.
chatRoutes.post("/new", verifyToken, validate(chatCompletionValidator), generateChatCompletion);
// Get all chats (summary)
// chatRoutes.get("/all-chats", verifyToken, getAllChats);
// Get single chat
// chatRoutes.get("/:id", verifyToken, getChat);
// Delete single chat
// chatRoutes.delete("/:id", verifyToken, deleteChat);
// Delete all chats (optional)
// chatRoutes.delete("/delete", verifyToken, deleteAllChats);
export default chatRoutes;
