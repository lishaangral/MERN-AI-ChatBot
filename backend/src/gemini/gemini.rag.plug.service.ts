import { GeminiProject } from "./gemini.project.model";
import { GeminiFile } from "./gemini.file.model";
import { Chat } from "../rag/rag.chat.model";
import { RagProject } from "../rag/project.model";
import { getRagDocumentsCollection } from "../rag/rag.documents.db";

export async function
plugRagChatToGemini(

  ragProjectId: string,
  ragChatId: string,
) {

  // LOAD SOURCE

  const ragProject =
    await RagProject.findById(
      ragProjectId
    );

  const ragChat =
    await Chat.findById(
      ragChatId
    );

  if (!ragProject || !ragChat) {
    throw new Error(
      "RAG source not found"
    );
  }

  // CREATE GEMINI PROJECT

  const geminiProject =
    await GeminiProject.create({

      name: `${ragProject.name} (Gemini)`,
      description: ragProject.description,
      projectType: "plugged",
      sourceRagProjectId: ragProjectId,
      sourceRagChatId: ragChatId,
      snapshotTimestamp: new Date(),
    });

  // COPY FILE REFERENCES

  const ragDocsCol = getRagDocumentsCollection();

  const docs = await ragDocsCol.find({
      projectId: ragProjectId,
    }).toArray();

  if (docs.length) {
    await GeminiFile.insertMany(
      docs.map((d: any) => ({
        projectId: geminiProject._id.toString(),
        filename: d.filename,
        fileUrl: d.fileUrl,
        mimeType: "application/pdf",
        size: d.size || 0,
        uploadedAt: new Date(),
        extractedPages: [],
        isEmbedded: true,
        isReferencedByRag: true,
        ragDocumentId:
          d.docId,
      }))
    );
  }

  // CREATE GEMINI CHAT

  const geminiChat =
    await Chat.create({

      projectId:
        geminiProject._id.toString(),

      workspaceType:
        "gemini",

      chatType:
        "plugged",

      linkedProjectId:
        ragProjectId,

      sourceChatId:
        ragChatId,

      snapshotTimestamp:
        new Date(),

      title:
        ragChat.title,

      memorySummary:
        ragChat.messages
          .slice(-12)
          .map(
            (m: any) =>
              `${m.role}: ${m.content}`
          )
          .join("\n"),

      messages: [],
    });

  return {

    geminiProjectId:
      geminiProject._id.toString(),

    geminiChatId:
      geminiChat._id.toString(),
  };
}