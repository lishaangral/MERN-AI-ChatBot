import { Request, Response } from "express";
import { Chat } from "../rag/rag.chat.model";
import { generateGeminiResponse, streamGeminiResponse } from "./gemini.service";
import {GeminiFile} from "./gemini.file.model";
import { buildPluggedGeminiContext } from "./gemini.context";

// CREATE GEMINI CHAT
export async function createGeminiChat(
  req: Request,
  res: Response
) {
  try {

    const {
      projectId,
      title,
      chatType,
      linkedProjectId,
    } = req.body;

    const chat = await Chat.create({
      workspaceType: "gemini",

      chatType: chatType || "standalone",
      projectId,
      linkedProjectId,
      title: title || "New Chat",
      messages: [],
    });

    return res.json({ chat });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Failed to create Gemini chat",
    });
  }
}

// LIST GEMINI CHATS
export async function listGeminiChats(
  req: Request,
  res: Response
) {

  try {

    const chats = await Chat.find({workspaceType: "gemini"}).sort({updatedAt: -1}).lean();
    return res.json({ chats });

  } catch (err) {

    console.error(err);
    return res.status(500).json({
      error:
        "Failed to fetch Gemini chats",
    });
  }
}

// GET SINGLE GEMINI CHAT
export async function getGeminiChat(
  req: Request,
  res: Response
) {

  try {

    const { chatId } = req.params;

    const chat =
      await Chat.findOne({
        _id: chatId,
        workspaceType:
          "gemini",
      }).lean();

    return res.json({ chat });

  } catch (err) {

    console.error(err);
    return res.status(500).json({
      error: "Failed to fetch Gemini chat",
    });
  }
}

// DELETE GEMINI CHAT
export async function deleteGeminiChat(
  req: Request,
  res: Response
) {

  try {

    const { chatId } = req.params;

    await Chat.findOneAndDelete({
      _id: chatId,
      workspaceType: "gemini",
    });

    return res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);
    return res.status(500).json({
      error: "Failed to delete Gemini chat",
    });
  }
}

// SEND GEMINI MESSAGE
export async function sendGeminiMessage(
  req: Request,
  res: Response
) {

  try {

    const {
      chatId,
      message,
    } = req.body;

    const existingChat = await Chat.findById(chatId).lean();

    if (!existingChat) {
    return res.status(404).json({
        error: "Chat not found",
    });
    }

    const previousMessages = (existingChat.messages || []).slice(-14);

    const files = await GeminiFile.find({
        projectId: existingChat.projectId,
    }).lean();

    const validFiles =
        files.filter(
            (f) =>
            f.extractedText &&
            f.extractedText.trim().length > 0
        );

    const fileContext =
        validFiles
            .map((f) => `
        FILE: ${f.filename}

        ${f.extractedText.slice(0, 12000)}
        `)
            .join("\n\n");

    const finalContext =
        fileContext.length > 0
            ? fileContext
            : "No readable project files available.";

    const pluggedContext =
      existingChat?.chatType === "plugged"

        ? await buildPluggedGeminiContext(
            existingChat
          ) : "Not applicable.";

    const answer =
    await generateGeminiResponse(
        previousMessages,
        `
        PROJECT FILE CONTEXT:

        ${finalContext}

        PLUGGED RAG CHAT CONTEXT:

        ${pluggedContext}

        USER QUESTION:
        ${message}
        `
    );
    const userMsg = {
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    const botMsg = {
      role: "assistant",
      content: answer,
      createdAt: new Date(),
    };

    const shouldRename =
    existingChat.title === "New Chat";

    await Chat.findByIdAndUpdate(chatId, {
        $push: {
            messages: {
            $each: [userMsg, botMsg],
            },
        },

        ...(shouldRename && {
            title:
            message.length > 40
                ? `${message.slice(0, 40)}...`
                : message,
        }),
    });

    const updatedChat =
      await Chat.findById(
        chatId
      ).lean();

    return res.json({
      chat: updatedChat,
      answer,
    });

  } catch (err) {

    console.error(err);
    return res.status(500).json({
      error: "Failed to send Gemini message",
    });
  }
}

export async function streamGeminiMessage(
  req: Request,
  res: Response
) {

  try {

    const {
      chatId,
      message,
    } = req.body;

    const existingChat =
      await Chat.findById(chatId);

    if (!existingChat) {

      return res.status(404).json({
        error: "Chat not found",
      });
    }

    const previousMessages =
      (existingChat.messages || [])
      .slice(-14);

    const files =
      await GeminiFile.find({
        projectId:
          existingChat.projectId,
      }).lean();

    const validFiles =
      files.filter(
        f =>
          f.extractedText?.trim()
      );

    const fileContext =
      validFiles.map(f => `

FILE: ${f.filename}

${f.extractedText.slice(0, 12000)}
`
      ).join("\n\n");

    const pluggedContext =
      existingChat.chatType === "plugged"

        ? await buildPluggedGeminiContext(
            existingChat
          )

        : "";

    const finalPrompt = `

PROJECT FILE CONTEXT:

${fileContext || "No readable files"}

PLUGGED CHAT CONTEXT:

${pluggedContext}

USER QUESTION:

${message}
`;

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

    const stream =
      await streamGeminiResponse(
        previousMessages,
        finalPrompt
      );

    let fullText = "";

    for await (
      const chunk of stream.stream
    ) {

      const text =
        chunk.text();

      fullText += text;

      res.write(
        `data: ${JSON.stringify(text)}\n\n`
      );
    }

    const userMsg = {
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    const botMsg = {
      role: "assistant",
      content: fullText,
      createdAt: new Date(),
    };

    const shouldRename =
      existingChat.title === "New Chat";

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
            message.length > 40

              ? `${message.slice(0, 40)}...`

              : message,
        }),
      }
    );

    res.write(
      `data: [DONE]\n\n`
    );

    if (!res.writableEnded) {
      res.end();
    }

  } catch (err) {

    console.error(err);

    res.write(
      `data: [ERROR]\n\n`
    );

    if (!res.writableEnded) {
      res.end();
    }
  }
}