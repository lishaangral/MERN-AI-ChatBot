import { Chat }
from "../rag/rag.chat.model";

export async function buildPluggedGeminiContext(
  chat: any
) {

  let context = "";

  // MEMORY SUMMARY

  if (chat.memorySummary) {

    context += `MEMORY SUMMARY: 
    ${chat.memorySummary}`;
  }

  // SOURCE RAG HISTORY

  if (
    chat.sourceChatId &&
    chat.snapshotTimestamp
  ) {

    const sourceChat =
      await Chat.findById(
        chat.sourceChatId
      ).lean();

    if (sourceChat) {

      const snapshotMessages =
        sourceChat.messages.filter(
          (m: any) =>
            new Date(m.createdAt)
            <=
            new Date(
              chat.snapshotTimestamp
            )
        );

      context += `
RAG SNAPSHOT HISTORY:
`;

      snapshotMessages
        .slice(-12)
        .forEach((m: any) => {

          context += `
${m.role}: ${m.content}
`;
        });
    }
  }

  // RECENT GEMINI HISTORY

  const recent =
    chat.messages.slice(-10);

  context += `
RECENT GEMINI HISTORY:
`;

  recent.forEach((m: any) => {

    context += `
${m.role}: ${m.content}
`;
  });

  return context;
}