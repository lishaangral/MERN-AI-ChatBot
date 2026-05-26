import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_SECRET!
);

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function generateGeminiResponse(
  messages: Message[],
  currentMessage: string
): Promise<string> {

  const model = genAI.getGenerativeModel({
    model:
      process.env.GEMINI_GENERATE_MODEL ||
      "gemini-1.5-flash",
  });

  const history = messages.map(m => ({
    role:
      m.role === "assistant"
        ? "model"
        : "user",

    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history,
  });

  const result =
    await chat.sendMessage(currentMessage);

  return result.response.text();
}

export function createGeminiChat(
  messages: Message[]
) {

  const model =
    genAI.getGenerativeModel({

      model:
        process.env
          .GEMINI_GENERATE_MODEL
        || "gemini-1.5-flash",
    });

  const history = messages.map(m => ({

    role:
      m.role === "assistant"
        ? "model"
        : "user",

    parts: [{
      text: m.content,
    }],
  }));

  return model.startChat({
    history,
  });
}

export async function
streamGeminiResponse(

  messages: Message[],
  currentMessage: string
) {

  const chat =
    createGeminiChat(messages);

  return chat.sendMessageStream(
    currentMessage
  );
}