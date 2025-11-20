import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Menu,
  ChevronDown,
  ChevronRight,
  Folder,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAllRagProjects,
  createRagProject,
  deleteRagProject,
  getProjectRagChats,
  createRagChatAPI,
  deleteRagChat,
} from "../../helpers/api-communicator";

type Props = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeProjectId?: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeChatId?: string | null;
  setActiveChatId: (id: string | null) => void;
};

const HEADER_HEIGHT = 64;

const RagSidebar: React.FC<Props> = ({
  collapsed,
  setCollapsed,
  activeProjectId,
  setActiveProjectId,
  activeChatId,
  setActiveChatId,
}) => {
  const nav = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
  const [projectChats, setProjectChats] = useState<Record<string, any[]>>({});

  const loadProjects = async () => {
    try {
      const res = await getAllRagProjects();
      setProjects(res.projects || []);
    } catch (err) {
      setProjects([]);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const fetchChatsFor = async (projectId: string) => {
    try {
      const res = await getProjectRagChats(projectId);
      setProjectChats((s) => ({ ...s, [projectId]: res.chats || [] }));
    } catch {
      setProjectChats((s) => ({ ...s, [projectId]: [] }));
    }
  };

  const toggleProject = async (id: string) => {
    setOpenProjects((s) => ({ ...s, [id]: !s[id] }));
    if (!projectChats[id]) await fetchChatsFor(id);
    setActiveProjectId(id);
    nav(`/rag/project/${id}`);
  };

  const handleCreateProject = async () => {
    const name = prompt("Project name");
    if (!name) return;
    const res = await createRagProject({ name });
    await loadProjects();
    if (res?.project) {
      setOpenProjects((s) => ({ ...s, [res.project._id]: true }));
      setProjectChats((s) => ({ ...s, [res.project._id]: [] }));
      setActiveProjectId(res.project._id);
      nav(`/rag/project/${res.project._id}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete project and all chats/doc references?")) return;
    await deleteRagProject(id);
    await loadProjects();
    setActiveProjectId(null);
    setActiveChatId(null);
    nav("/rag");
  };

  const createNewChat = async (projectId: string) => {
    const res = await createRagChatAPI(projectId, "New chat");
    await fetchChatsFor(projectId);
    setActiveProjectId(projectId);
    setActiveChatId(res.chat._id);
    nav(`/rag/project/${projectId}/chat/${res.chat._id}`);
  };

  const openChat = (projectId: string, chatId: string) => {
    setActiveProjectId(projectId);
    setActiveChatId(chatId);
    nav(`/rag/project/${projectId}/chat/${chatId}`);
  };

  const handleDeleteChat = async (projectId: string, chatId: string) => {
    if (!confirm("Delete this chat?")) return;
    try {
      await deleteRagChat(chatId);
    } catch (err) {
      console.warn("deleteRagChat failed (make sure backend implements endpoint):", err);
    }
    await fetchChatsFor(projectId);
    if (activeChatId === chatId) {
      setActiveChatId(null);
      nav(`/rag/project/${projectId}`);
    }
  };

  return (
    <>
      {/* Always-visible hamburger (outside scroll area & visible when collapsed) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "fixed",
          top: HEADER_HEIGHT + 12,
          left: collapsed ? 12 : 312,
          zIndex: 9999,
          background: "rgba(255,255,255,0.06)",
          border: "none",
          padding: 8,
          borderRadius: 8,
          cursor: "pointer",
          transition: "left 0.2s ease",
        }}
        aria-label="Toggle RAG sidebar"
      >
        <Menu size={18} />
      </button>

      <aside
        style={{
          width: collapsed ? 80 : 300,
          height: "100vh",
          paddingTop: HEADER_HEIGHT,
          background: "#061019",
          color: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          overflowY: "auto",
          transition: "width 0.25s ease",
          boxShadow: "rgba(3, 7, 18, 0.6) 0 0 0 1px inset",
        }}
      >
        <div style={{ padding: 18 }}>
          {/* top area: only show full controls when not collapsed */}
          {!collapsed ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={handleCreateProject}
                style={{
                  display: "inline-flex",
                  gap: 8,
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} /> New Project
              </button>
            </div>
          ) : (
            // collapsed small spacer
            <div style={{ height: 8 }} />
          )}

          {/* Projects header */}
          <h4 style={{ margin: "18px 0 12px", opacity: collapsed ? 0 : 0.8 }}>
            Projects
          </h4>

          {/* Projects list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {projects.map((p) => {
              const isOpen = !!openProjects[p._id];
              const chats = projectChats[p._id] || [];
              const isActiveProject = activeProjectId === p._id;

              return (
                <div
                  key={p._id}
                  style={{
                    borderRadius: 10,
                    padding: collapsed ? 8 : 10,
                    background: isActiveProject ? "rgba(255,255,255,0.02)" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div
                      onClick={() => toggleProject(p._id)}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {/* when collapsed: show only a simple folder icon (no extra file icons) */}
                      <div style={{ width: 22, display: "grid", placeItems: "center" }}>
                        <Folder size={18} />
                      </div>

                      {!collapsed && (
                        <>
                          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                        </>
                      )}
                    </div>

                    {!collapsed && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => createNewChat(p._id)}
                          style={{
                            padding: "6px 8px",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.08)",
                            cursor: "pointer",
                          }}
                        >
                          + New
                        </button>

                        <button onClick={() => handleDeleteProject(p._id)} style={{ padding: 6, borderRadius: 6 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* nested chats list (only when expanded) */}
                  {!collapsed && isOpen && (
                    <div style={{ marginTop: 10, marginLeft: 28 }}>
                      {chats.length === 0 ? (
                        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>No chats yet</div>
                      ) : (
                        chats.map((c) => {
                          const isActive = activeChatId === c._id;
                          return (
                            <div
                              key={c._id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 10px",
                                marginBottom: 8,
                                borderRadius: 8,
                                background: isActive ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                                cursor: "pointer",
                              }}
                            >
                              <div onClick={() => openChat(p._id, c._id)} style={{ display: "flex", gap: 10 }}>
                                <MessageSquare size={14} />
                                <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 600 }}>{c.title || "Untitled chat"}</div>
                              </div>

                              <div>
                                <button onClick={() => handleDeleteChat(p._id, c._id)} title="Delete chat" style={{ padding: 6, borderRadius: 6 }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default RagSidebar;
