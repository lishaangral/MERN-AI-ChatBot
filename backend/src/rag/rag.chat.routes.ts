import express from "express";
import { createRagChat, listRagChats, getRagChat, sendMessage, deleteRagChat, streamRagMessage } from "./rag.chat.controller";
const router = express.Router();

router.post("/chat/create", createRagChat);           // body { projectId, title }
router.get("/chat/project/:projectId", listRagChats); // get all chats for project
router.get("/chat/:chatId", getRagChat);              // get a single chat
router.post("/chat/send", sendMessage);            // { chatId?, projectId, message }
router.delete("/chat/:chatId", deleteRagChat);
router.post("/chat/stream", streamRagMessage);

export default router;
