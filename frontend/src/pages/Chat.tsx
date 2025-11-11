import React, { useEffect, useState, useRef } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "../context/useAuth";
import Sidebar from "../components/shared/Sidebar";
import Message from "../components/shared/Message";
import PromptForm from "../components/shared/PromptForm";
import {
  createChatAPI,
  getUserChats,
  getChatById,
  deleteChatById,
  sendChatRequest,
} from "../helpers/api-communicator";

type MessageType = {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  loading?: boolean;
  error?: boolean;
};

const Chat: React.FC = () => {
  const auth = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  // change: use undefined rather than null so other helpers expecting `string | undefined` accept it
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [activeChat, setActiveChat] = useState<{ id: string; title: string; messages: MessageType[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => window.innerWidth > 768);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // On mount, ensure user has a chat selected
  useEffect(() => {
    if (!auth?.isLoggedIn) return;
    (async () => {
      await ensureAtLeastOneChat();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoggedIn]);

  // Ensure at least one chat exists and select it
  const ensureAtLeastOneChat = async () => {
    try {
      const res = await getUserChats();
      const list = res.chats || [];
      setChats(list);
      if (list.length > 0) {
        setActiveChatId(list[0].id);
      } else {
        const created = await createChatAPI();
        const newId = created.chat.id;
        await reloadChatsAndSelect(newId);
      }
    } catch (err) {
      console.error("ensureAtLeastOneChat error", err);
    }
  };

  const reloadChatsAndSelect = async (selectId?: string) => {
    try {
      const res = await getUserChats();
      setChats(res.chats || []);
      if (selectId) setActiveChatId(selectId ?? undefined);
      else if (res.chats && res.chats.length > 0 && !activeChatId) setActiveChatId(res.chats[0].id);
    } catch (err) {
      console.error("reloadChatsAndSelect error", err);
    }
  };

  // Load active chat details when activeChatId changes
  useEffect(() => {
    if (!activeChatId) return;
    (async () => {
      try {
        const res = await getChatById(activeChatId);
        const c = res.chat;
        setActiveChat({ id: c.id, title: c.title, messages: c.messages || [] });
      } catch (err) {
        console.error("getChatById error", err);
      }
    })();
  }, [activeChatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [activeChat?.messages?.length]);

  // Create new chat
  const handleCreate = async () => {
    try {
      const res = await createChatAPI();
      const newId = res.chat.id || res.chat.id;
      await reloadChatsAndSelect(newId);
    } catch (err) {
      console.error("handleCreate error", err);
    }
  };

  // Delete chat
  const handleDelete = async (id: string) => {
    try {
      await deleteChatById(id);
      if (activeChatId === id) {
        setActiveChatId(undefined);
        setActiveChat(null);
      }
      await reloadChatsAndSelect();
      // if no chats left, create a default one
      const after = await getUserChats();
      if (!after.chats || after.chats.length === 0) {
        const created = await createChatAPI();
        const newId = created.chat.id;
        await reloadChatsAndSelect(newId);
      }
    } catch (err) {
      console.error("handleDelete error", err);
    }
  };

  // State helpers for messages in memory (optimistic UI)
  const appendMessageToActiveChat = (msg: MessageType) => {
    setActiveChat(prev => {
      if (!prev) return prev;
      return { ...prev, messages: [...prev.messages, msg] };
    });
  };

  const replaceMessageInActiveChat = (replaceId: string, nextMsg: MessageType) => {
    setActiveChat(prev => {
      if (!prev) return prev;
      const msgs = prev.messages.map(m => (m.id === replaceId ? nextMsg : m));
      return { ...prev, messages: msgs };
    });
  };

  // Send prompt (used by composer and tiles) with optimistic UI

  const sendPrompt = async (promptText: string) => {
    setIsLoading(true);
    try {
      let chatId = activeChatId;
      if (!chatId) {
        const created = await createChatAPI();
        chatId = created.chat.id;
        await reloadChatsAndSelect(chatId);
      }

      // optimistic user message
      const userMsgId = `user-${Date.now()}`;
      const userMsg: MessageType = { id: userMsgId, role: "user", content: promptText };
      appendMessageToActiveChat(userMsg);

      // optimistic thinking message
      const botTempId = `bot-${Date.now()}`;
      const thinkingMsg: MessageType = { id: botTempId, role: "model", content: "Thinking...", loading: true };
      appendMessageToActiveChat(thinkingMsg);

      // call backend
      const res = await sendChatRequest(promptText, chatId);
      const returnedChat = res.chat;
      const assistant = returnedChat?.messages?.[returnedChat.messages.length - 1];

      if (assistant) {
        const assistantMsg: MessageType = {
          id: assistant.id || `model-${Date.now()}`,
          role: "model",
          content: assistant.content || "",
          loading: false,
        };
        replaceMessageInActiveChat(botTempId, assistantMsg);
      } else {
        replaceMessageInActiveChat(botTempId, { id: botTempId, role: "model", content: "No response from model", loading: false, error: true });
      }
    } catch (err: any) {
      console.error("sendPrompt error", err);
      const errId = `bot-${Date.now()}`;
      appendMessageToActiveChat({ id: errId, role: "model", content: err?.message || "Error", loading: false, error: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTileClick = async (tileText: string) => {
    // convenience tiles: send tile text immediately but composer remains usable
    await sendPrompt(tileText);
  };

  return (
    <div className="chat-page" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar
        conversations={chats}
        setConversations={(c) => setChats(c)}
        activeConversation={activeChatId}
        setActiveConversation={(id) => setActiveChatId(id ?? undefined)}
        createNewConversation={handleCreate}
        deleteConversation={handleDelete}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Main area */}
      <main
        className="chat-main"
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? 0 : 0, // sidebar overlays by default; modify if you push content instead
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header with hamburger to toggle sidebar */}
        <header style={{ display: "flex", alignItems: "center", padding: 12 }}>
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            aria-label="Toggle sidebar"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />
        </header>

        {/* No active chat at all -> show full welcome */}
        {!activeChat ? (
          <div className="welcome-area" style={{ padding: 24, textAlign: "center" }}>
            <h1>Welcome, {auth?.user?.name}</h1>
            <p>What can I help you with today?</p>
            <div className="starter-cards" style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 28 }}>
              <div className="card">Create an image</div>
              <div className="card">Try voice</div>
              <div className="card">Take a quiz</div>
              <div className="card">Write a first draft</div>
            </div>
          </div>
        ) : (
          <>
            {/* If chat exists but empty show helper tiles (optional), composer always visible */}
            {activeChat.messages.length === 0 && (
              <div className="welcome-area" style={{ padding: 24, textAlign: "center" }}>
                <h1>Welcome, {auth?.user?.name}</h1>
                <p>What can I help you with today?</p>
                <div className="starter-cards" style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 28 }}>
                  <div className="card" style={{ cursor: "pointer" }} onClick={() => handleTileClick("I want to learn a language.")}>Learn a language</div>
                  <div className="card" style={{ cursor: "pointer" }} onClick={() => handleTileClick("Write an essay.")}>Write an essay</div>
                  <div className="card" style={{ cursor: "pointer" }} onClick={() => handleTileClick("Take a quiz on any topic you desire or ask me for a topic.")}>Take a quiz</div>
                  <div className="card" style={{ cursor: "pointer" }} onClick={() => handleTileClick("Provide a Recipe.")}>Provide a Recipe</div>
                </div>
                <div style={{ textAlign: "center", marginTop: 24, color: "var(--muted)" }}>
                  Tip: click a tile to start the conversation automatically — or type below.
                </div>
              </div>
            )}

            {/* Messages area */}
            <div className="messages" ref={messagesRef} style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {activeChat.messages.length > 0 ? (
                activeChat.messages.map((m) => <Message key={m.id} message={m} />)
              ) : (
                <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>No messages yet — say hi!</div>
              )}
            </div>

            {/* Composer always visible when a chat exists */}
            <div className="composer" style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <PromptForm onSend={sendPrompt} />

              <div className="disclaimer" style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                Gemini can make mistakes — double-check the results.
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Chat;
