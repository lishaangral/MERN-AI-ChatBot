// frontend/src/components/shared/PromptForm.tsx
import React, { useState } from "react";
import { ArrowUp } from "lucide-react";
import { sendChatRequest, createChatAPI } from "../../helpers/api-communicator";

type Props = {
  activeChatId?: string | null;
  onNewMessage: (msg: any) => void;
  setIsLoading: (b: boolean) => void;
};

const PromptForm: React.FC<Props> = ({ activeChatId, onNewMessage, setIsLoading }) => {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsLoading(true);

    // ensure chat exists: if no activeChatId, create one
    let chatId = activeChatId;
    try {
      if (!chatId) {
        const created = await createChatAPI();
        chatId = created.chat._id || created.chat.id;
      }

      // optimistic: append user message
      const userMsg = { id: `user-${Date.now()}`, role: "user", content: text };
      onNewMessage(userMsg);

      // add thinking message
      const botId = `bot-${Date.now()}`;
      const thinking = { id: botId, role: "model", content: "Thinking...", loading: true };
      onNewMessage(thinking);

      // send to backend
      const res = await sendChatRequest(text, chatId);
      // backend returns { chat }
      const returnedChat = res.chat;
      // last message should be the assistant response we just saved on server
      const assistant = returnedChat.messages && returnedChat.messages[returnedChat.messages.length - 1];

      if (assistant) {
        onNewMessage({ replaceId: botId, message: { id: assistant.id || `model-${Date.now()}`, role: "model", content: assistant.content, loading: false } });
      } else {
        onNewMessage({ replaceId: botId, message: { id: botId, role: "model", content: "No response from model", loading: false, error: true } });
      }
    } catch (err: any) {
      console.error("PromptForm submit error", err);
      onNewMessage({ replaceId: `bot-${Date.now()}`, message: { id: `bot-${Date.now()}`, role: "model", content: err?.message || "Error", loading: false, error: true } });
    } finally {
      setText("");
      setIsLoading(false);
    }
  };

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <input className="prompt-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message Gemini..." />
      <button type="submit" className="send-prompt-btn" aria-label="Send">
        <ArrowUp size={18} />
      </button>
    </form>
  );
};

export default PromptForm;
