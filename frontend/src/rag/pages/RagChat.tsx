// frontend/src/rag/pages/RagChat.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRagChatById,
  sendRagChatMessage,
  createRagChatAPI,
  getProjectRagChats,
} from "../../helpers/api-communicator";
import RagMessage from "../components/RagMessage";

type Msg = { role: "user" | "assistant"; content: string; createdAt?: string };

const RagChat: React.FC<{ createNew?: boolean }> = ({ createNew }) => {
  const { projectId, chatId } = useParams<{ projectId: string; chatId?: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId ?? null);

  const messagesRef = useRef<HTMLDivElement | null>(null);

  // if the route requested "create new" behavior
  useEffect(() => {
    if (createNew && projectId) {
      (async () => {
        const res = await createRagChatAPI(projectId, "New chat");
        if (res?.chat?._id) {
          navigate(`/rag/project/${projectId}/chat/${res.chat._id}`);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createNew, projectId]);

  // keep currentChatId in sync with URL param
  useEffect(() => {
    setCurrentChatId(chatId ?? null);
  }, [chatId]);

  // load messages when chat changes
  useEffect(() => {
    if (!currentChatId) return;
    (async () => {
      try {
        const res = await getRagChatById(currentChatId);
        setMessages(res.chat?.messages || []);
      } catch (err) {
        console.error("Failed to load chat:", err);
        setMessages([]);
      }
    })();
  }, [currentChatId]);

  // scroll when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!projectId) return alert("Project not specified.");
    setLoading(true);

    // optimistic add
    const userMsg: Msg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    const payload = {
      chatId: currentChatId,
      projectId,
      message: input,
    };
    setInput("");

    try {
      const res = await sendRagChatMessage(payload as any);
      // server returns chat with messages; update display
      setMessages(res.chat?.messages || []);
      // if server created a new chat, navigate to it
      if (!currentChatId && res.chat && res.chat._id) {
        navigate(`/rag/project/${projectId}/chat/${res.chat._id}`);
      }
    } catch (err) {
      console.error("send error", err);
      // on error, keep optimistic message and show simple error message as assistant
      setMessages((m) => [...m, { role: "assistant", content: "Error: failed to send message." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // If no chat selected, show a helper
  if (!currentChatId) {
    return (
      <div style={{ padding: 28, color: "white" }}>
        <h2 style={{ marginTop: 8 }}>Project Chat</h2>
        <p style={{ color: "rgba(255,255,255,0.75)" }}>
          Select a chat from the left sidebar or click <strong>Open RAG Scientific Chat</strong> on the project page to start.
        </p>
        <div style={{ marginTop: 20 }}>
          <button
            onClick={async () => {
              // if no chats yet, create one and open it
              if (!projectId) return;
              const res = await getProjectRagChats(projectId);
              if (res.chats && res.chats.length > 0) {
                navigate(`/rag/project/${projectId}/chat/${res.chats[0]._id}`);
              } else {
                const created = await createRagChatAPI(projectId, "New chat");
                if (created?.chat?._id) navigate(`/rag/project/${projectId}/chat/${created.chat._id}`);
              }
            }}
            style={{ padding: "10px 14px", borderRadius: 8, background: "#6b8cff", color: "#fff", border: "none" }}
          >
            Create first chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", color: "white" }}>
      <div ref={messagesRef} style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {messages.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.6)" }}>No messages yet — ask a question about your documents.</div>
        ) : (
          messages.map((m, i) => (
            <RagMessage key={i} message={m} />
            ))
        )}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: 12 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the uploaded documents. Press Enter to send (Shift+Enter for newline)."
          rows={3}
          style={{ width: "100%", padding: 10, borderRadius: 8, resize: "vertical" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={handleSend} disabled={loading} style={{ padding: "8px 12px", borderRadius: 8 }}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RagChat;
