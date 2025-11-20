// frontend/src/rag/components/RagSidebar.tsx
import React, { useEffect, useState } from "react";
import {
  Folder,
  MessageSquare,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAllRagProjects,
  createRagProject,
  deleteRagProject,
  getProjectRagChats,
  createRagChatAPI,
  deleteRagChat,
  getRagDocuments,
} from "../../helpers/api-communicator";

type Props = {
  activeProjectId?: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeChatId?: string | null;
  setActiveChatId: (id: string | null) => void;
  reloadProjects?: boolean;
  onReloadComplete?: () => void;
};

const RagSidebar: React.FC<Props> = ({
  activeProjectId,
  setActiveProjectId,
  activeChatId,
  setActiveChatId,
  reloadProjects,
  onReloadComplete,
}) => {
  const nav = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
  const [projectChats, setProjectChats] = useState<Record<string, any[]>>({});

  // LOAD PROJECTS
  const loadProjects = async () => {
    try {
      const res = await getAllRagProjects();
      setProjects(res.projects || []);
    } catch (err) {
      console.error("Error loading projects", err);
    }
  };

  useEffect(() => {
    const needsReload = sessionStorage.getItem("rag_force_reload");

    loadProjects();

    if (needsReload) {
      sessionStorage.removeItem("rag_force_reload");
    }
  }, []);

  // LOAD CHATS OF A PROJECT
  const fetchChatsFor = async (projectId: string) => {
    try {
      const res = await getProjectRagChats(projectId);
      setProjectChats((s) => ({ ...s, [projectId]: res.chats || [] }));
    } catch (err) {
      console.error("Error fetching chats", err);
      setProjectChats((s) => ({ ...s, [projectId]: [] }));
    }
  };

  // TOGGLE OPEN/CLOSE PROJECT FOLDER
  const toggleProject = async (projectId: string) => {
    setOpenProjects((s) => ({ ...s, [projectId]: !s[projectId] }));

    if (!projectChats[projectId]) await fetchChatsFor(projectId);

    setActiveProjectId(projectId);
    setActiveChatId(null);
    nav(`/rag/project/${projectId}`);
  };

  // CREATE PROJECT
  const handleCreateProject = async () => {
    const name = prompt("Enter project name:");
    if (!name) return;

    const res = await createRagProject({ name });
    await loadProjects();

    const p = res.project;
    if (p) {
      setOpenProjects((s) => ({ ...s, [p._id]: true }));
      setActiveProjectId(p._id);
      setActiveChatId(null);
      nav(`/rag/project/${p._id}`);
    }
  };

  // DELETE PROJECT
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Delete this project and all chats?")) return;

    await deleteRagProject(projectId);
    await loadProjects();

    setActiveProjectId(null);
    setActiveChatId(null);
    nav("/rag");
  };

  // CREATE NEW CHAT — ONLY IF DOCUMENTS EXIST
  const createNewChat = async (projectId: string) => {
    const docs = await getRagDocuments(projectId);
    if (!docs.documents || docs.documents.length === 0) {
      alert("Upload at least 1 document before creating a chat.");
      return;
    }

    const res = await createRagChatAPI(projectId, "New chat");
    await fetchChatsFor(projectId);

    setActiveProjectId(projectId);
    setActiveChatId(res.chat._id);

    nav(`/rag/project/${projectId}/chat/${res.chat._id}`);
  };

  // OPEN CHAT
  const openChat = (projectId: string, chatId: string) => {
    setActiveProjectId(projectId);
    setActiveChatId(chatId);
    nav(`/rag/project/${projectId}/chat/${chatId}`);
  };

  // DELETE CHAT
  const handleDeleteChat = async (projectId: string, chatId: string) => {
    if (!confirm("Delete this chat?")) return;

    await deleteRagChat(chatId);
    await fetchChatsFor(projectId);

    if (activeChatId === chatId) {
      setActiveChatId(null);
      nav(`/rag/project/${projectId}`);
    }
  };

  // RENDER UI
  return (
    <aside
      className="rag-sidebar"
      style={{
        width: 300,
        padding: 16,
        background: "#061019",
        color: "white",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        overflowY: "auto",
      }}
    >
      {/* NEW PROJECT */}
      <button
        onClick={handleCreateProject}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <Plus size={16} /> New Project
      </button>

      <h4 style={{ marginTop: 20, marginBottom: 12, opacity: 0.8 }}>
        Projects
      </h4>

      {projects.map((p) => {
        const isOpen = openProjects[p._id];
        const chats = projectChats[p._id] || [];
        const isActiveProject = activeProjectId === p._id;

        return (
          <div
            key={p._id}
            style={{
              padding: 10,
              borderRadius: 10,
              background: isActiveProject
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.02)",
              marginBottom: 10,
            }}
          >
            {/* PROJECT ROW */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* CLICK TO OPEN PROJECT */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  cursor: "pointer",
                  alignItems: "center",
                }}
                onClick={() => toggleProject(p._id)}
              >
                {isOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <Folder size={16} />
                <div style={{ fontWeight: 700 }}>{p.name}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => createNewChat(p._id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  + Chat
                </button>

                <button
                  onClick={() => handleDeleteProject(p._id)}
                  style={{ padding: 4, borderRadius: 6 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* CHAT LIST */}
            {isOpen && (
              <div style={{ marginTop: 10, marginLeft: 25 }}>
                {chats.length === 0 ? (
                  <div
                    style={{
                      fontSize: 13,
                      opacity: 0.6,
                      paddingLeft: 4,
                    }}
                  >
                    No chats
                  </div>
                ) : (
                  chats.map((chat) => {
                    const isActive = activeChatId === chat._id;

                    return (
                      <div
                        key={chat._id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 10px",
                          borderRadius: 8,
                          marginBottom: 6,
                          background: isActive
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(255,255,255,0.05)",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          onClick={() => openChat(p._id, chat._id)}
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <MessageSquare size={14} />
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {chat.title || "Untitled chat"}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteChat(p._id, chat._id)}
                          style={{ padding: 4, borderRadius: 6 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};

export default RagSidebar;
