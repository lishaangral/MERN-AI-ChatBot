// frontend/src/components/shared/Sidebar.tsx
import React, { useEffect } from "react";
import { Menu, Plus, Trash2 } from "lucide-react";

type Conversation = { id: string; title: string; messages?: any[] };

type Props = {
  conversations: Conversation[];
  setConversations: (c: Conversation[]) => void;
  activeConversation?: string | null;
  setActiveConversation: (id: string | null) => void;
  createNewConversation: () => void;
  deleteConversation: (id: string) => void;
  isOpen?: boolean;
  onToggle?: () => void; // toggle open/close
};

const HEADER_HEIGHT_PX = 64; // keep in sync with App.css header height

const Sidebar: React.FC<Props> = ({
  conversations,
  setConversations,
  activeConversation,
  setActiveConversation,
  createNewConversation,
  deleteConversation,
  isOpen = true,
  onToggle,
}) => {
  // close on Escape when sidebar is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onToggle) {
        onToggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!isOpen}
        onClick={() => onToggle && onToggle()}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: HEADER_HEIGHT_PX,
          bottom: 0,
          background: isOpen ? "rgba(0,0,0,0.35)" : "transparent",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity .2s ease",
          zIndex: 40,
        }}
      />

      <aside
        className={`sidebar ${isOpen ? "open" : "closed"}`}
        aria-hidden={!isOpen}
        style={{
          position: "fixed",
          left: 0,
          top: HEADER_HEIGHT_PX, // <-- place below header
          bottom: 0,
          width: 280,
          background: "#0b1116",
          color: "#fff",
          zIndex: 41,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .22s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="sidebar-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          <button
            type="button"
            onClick={() => onToggle && onToggle()}
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            className="sidebar-toggle"
            data-testid="sidebar-toggle"
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: 6,
            }}
          >
            <Menu size={18} />
          </button>

          {/* NEW CHAT BUTTON - always rendered */}
          <button
            type="button"
            onClick={createNewConversation}
            className="new-chat-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(255,255,255,0.02)",
              cursor: "pointer",
            }}
            aria-label="Create new chat"
            data-testid="new-chat-btn"
          >
            <Plus size={14} />
            <span style={{ fontSize: 14 }}>New chat</span>
          </button>
        </div>

        <div
          className="sidebar-content"
          style={{ padding: "14px 12px", overflowY: "auto", flex: 1 }}
        >
          <h2 style={{ margin: "8px 0 16px", fontSize: 20 }}>Conversations</h2>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {conversations.map((conv) => (
              <li
                key={conv.id}
                className={`conversation-item ${activeConversation === conv.id ? "active" : ""}`}
                onClick={() => setActiveConversation(conv.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setActiveConversation(conv.id); }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: activeConversation === conv.id ? "rgba(255,255,255,0.03)" : "transparent",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.02)" }}>
                    💬
                  </div>
                  <div style={{ fontSize: 14, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.title || "New Chat"}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 6,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    aria-label="Delete conversation"
                    data-testid={`delete-${conv.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.02)" }}>
          {/* Footer controls can be added here */}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
