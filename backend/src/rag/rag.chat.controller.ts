import { Request, Response } from "express";
import { Chat, ICitation } from "./rag.chat.model";
import { streamAnswerFromChunks, generateAnswerFromChunks, searchRelevantChunks } from "./rag.service";

export async function createRagChat(req: Request, res: Response) {
  const { projectId, workspaceType, title } = req.body;

  const chat = await Chat.create({
    projectId,
    workspaceType,
    chatType: "project",
    title: title || "New Chat",
    messages: [],
  });

  res.json({ chat });
}

// list chats for project
export async function listRagChats(req: Request, res: Response) {
  const { projectId } = req.params;
  const chats = await Chat.find({ projectId }).sort({ updatedAt: -1 }).lean();
  res.json({ chats });
}

// delete chat
export async function deleteRagChat(req: Request, res: Response) {
  const { chatId } = req.params;

  try {
    const deleted = await Chat.findByIdAndDelete(chatId);
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
  const chat = await Chat.findById(chatId).lean();
  res.json({ chat });
}

// send message (user prompt) -> generate answer + store both in chat

export async function sendMessage(req: Request, res: Response) {
  try {
    const { chatId, projectId, message, workspaceType } = req.body;

    if (!chatId || !projectId || !message) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    let answer = "";
    let chunks: any[] = [];
    let citations: ICitation[] = [];

    // 🔷 RAG MODE
    if (workspaceType === "rag") {
      chunks = await searchRelevantChunks(projectId, message);
      const texts = chunks.map((c) => c.chunk);
      citations = chunks.map((c: any) => ({
        chunk: c.chunk,
        source: c.metadata?.source,
        pageNumber: c.metadata?.pageNumber,
        preview: c.metadata?.preview,
        score: c.score,
        docId: c.docId,
      }))

      // answer = await generateAnswerFromChunks(texts, message);
      if (!texts.length) {
        answer = "No relevant context found in this project.";
      } else {
        answer = await generateAnswerFromChunks(texts, message);
      }
    }

    // 🔷 GEMINI MODE
    else {
      // answer = await generateGeminiResponse(message);
    }

    const userMsg = { role: "user", content: message, createdAt: new Date() };
    const botMsg = { role: "assistant", content: answer, citations, createdAt: new Date() };

    let chat;

    // if (chatId) {
    //   await Chat.findByIdAndUpdate(chatId, {
    //     $push: { messages: { $each: [userMsg, botMsg] } },
    //   });

    //   chat = await Chat.findById(chatId).lean();
    // } 

    if (chatId) {
      const existingChat = await Chat.findById(chatId);

      const shouldRename =
        existingChat?.title === "New Chat" &&
        existingChat.messages.length === 0;

      await Chat.findByIdAndUpdate(chatId, {
        $push: {
          messages: {
            $each: [userMsg, botMsg],
          },
        },

        ...(shouldRename && {
          title:
            message.length > 30
              ? message.slice(0, 30) + "..."
              : message,
        }),
      });

      chat = await Chat.findById(chatId).lean();
    } else {
      chat = await Chat.create({
        projectId,
        workspaceType,
        chatType: "project",
        title: message.slice(0, 30),
        messages: [userMsg, botMsg],
      });
    }

    // res.json({ chat, answer });
    return res.json({
      chat,
      answer,
      citations,
    });
  } catch (err: any) {
    console.error("RAG CHAT ERROR: ", err);
    return res.status(500).json({ error: err?.message || "Failed to generate response" });
  }
}

export async function streamRagMessage(
  req: Request,
  res: Response
) {
  try {
    const {
      chatId,
      projectId,
      message,
    } = req.body;

    const chunks = await searchRelevantChunks(
        projectId,
        message
      );

    const citations = chunks.map((c: any) => ({
        chunk: c.chunk,
        source: c.metadata?.source,
        pageNumber: c.metadata?.pageNumber,
        preview: c.metadata?.preview,
        score: c.score,
        docId: c.docId,
      }));

    const texts = chunks.map((c: any) =>
        c.chunk
      );

    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    res.flushHeaders();

    let fullText = "";

    if (!texts.length) {

      res.write(
        `data: ${JSON.stringify(
          "No relevant context found."
        )}\n\n`
      );

    } else {

      const stream =
        await streamAnswerFromChunks(
          texts,
          message
        );

      try {

        for await (
          const chunk of stream.stream
        ) {

          const text =
            chunk.text();

          if (!text) continue;

          fullText += text;

          res.write(
            `data: ${JSON.stringify({
              text,
            })}\n\n`
          );
        }

      } catch (streamErr: any) {

        console.error(
          "Gemini stream ended:",
          streamErr.message
        );
      }
    }

    const userMsg = {
      role: "user",
      content: message,
      createdAt:
        new Date(),
    };

    const botMsg = {
      role: "assistant",
      content: fullText,
      citations,
      createdAt: new Date(),
    };

    const existingChat = await Chat.findById(chatId);

    const shouldRename = existingChat?.title === "New Chat";

    await Chat.findByIdAndUpdate(
      chatId,
      {

        $push: {
          messages: {
            $each: [
              userMsg,
              botMsg,
            ],
          },
        },

        ...(shouldRename && {

          title:
            message.length > 30

              ? `${message.slice(0, 30)}...`

              : message,
        }),
      }
    );

    res.write(
      `data: ${JSON.stringify({
        done: true,
        citations,
      })}\n\n`
    );

    if (!res.writableEnded) {
      res.end();
    }

  } catch (err: any) {

    console.error(err);

    res.write(
      `data: ${JSON.stringify({
        error: true,
      })}\n\n`
    );

    if (!res.writableEnded) {
      res.end();
    }
  }
}