import express from "express";
import {
  createGeminiChat,
  listGeminiChats,
  getGeminiChat,
  sendGeminiMessage,
  deleteGeminiChat,
  streamGeminiMessage,
} from "./gemini.chat.controller";

const router = express.Router();

router.post("/chat/create", createGeminiChat);
router.get("/chat/all", listGeminiChats);
router.get("/chat/:chatId", getGeminiChat);
router.post("/chat/send", sendGeminiMessage);
router.delete("/chat/:chatId", deleteGeminiChat);
router.post("/chat/stream", streamGeminiMessage);

export default router;