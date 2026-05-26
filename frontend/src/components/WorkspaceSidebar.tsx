import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Plus, PanelLeftClose, PanelLeft, FolderOpen, MessageSquare, Trash2, ChevronRight, ChevronDown, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspace";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllRagProjects,
  getProjectRagChats,
  deleteRagChat,

  getGeminiProjects,
  getGeminiChats,
  deleteGeminiChat,

} from "@/helpers/api-communicator";
import { toast } from "react-hot-toast";

interface WorkspaceSidebarProps {
  workspaceType: "rag" | "gemini";
}

const WorkspaceSidebar = ({ workspaceType }: WorkspaceSidebarProps) => {
  type Message = {
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  };

  type Chat = {
    _id: string;
    projectId?: string;
    workspaceType: "rag" | "gemini";
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
  };

  type Project = {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };

  type GeminiChat = {
    _id: string;
    title: string;
    projectId?: string;
    chatType: "standalone" | "project" | "plugged";
    createdAt: string;
    updatedAt: string;
  };

  type GeminiProject = {
    _id: string;
    name: string;
    projectType: "native" | "plugged";
    sourceRagProjectId?: string;
    sourceRagChatId?: string;
    createdAt: string;
    updatedAt: string;
  };

  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectChats, setProjectChats] = useState<Record<string, Chat[] | GeminiChat[]>>({});
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, chatId } = useParams();
  const basePath = workspaceType === "rag" ? "/rag" : "/gemini";
  const isGemini = workspaceType === "gemini";
  const [geminiChats, setGeminiChats] = useState<GeminiChat[]>([]);
  const [geminiProjects, setGeminiProjects] = useState<GeminiProject[]>([]);

  // const pluggedProjects = isGemini ? getPluggedProjects() : [];
  const ragProjects = isGemini ? [] : projects;
  const nativeGeminiProjects = geminiProjects.filter(
    p => p.projectType === "native"
  );
  const pluggedGeminiProjects = geminiProjects.filter(
    p => p.projectType === "plugged"
  );

  useEffect(() => {
    async function load() {
      try {
        const [chatRes] = await Promise.all([
          getGeminiChats(),
        ]);

        setGeminiChats(chatRes.chats || []);
      } catch (err) {
        console.error(err);
      }
    }
    const loadProjects = async () => {
    try {
      if (isGemini) {
        const res = await getGeminiProjects();
        setGeminiProjects(res.projects || []);
      } else {
        const res = await getAllRagProjects();
        setProjects(res.projects || []);
      }
    } catch (err) {
      console.error("Sidebar projects error", err);
    }
  };

    load();
    loadProjects();
  }, [isGemini]);
  

  const toggleProject = async (pid: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [pid]: !prev[pid],
    }));

    if (projectChats[pid]) return;

    try {
      if (isGemini) {
        const res = await getGeminiChats();

        const filtered = (res.chats || []).filter(
          (c: GeminiChat) => c.projectId === pid
        );

        setProjectChats(prev => ({
          ...prev,
          [pid]: filtered,
        }));

      } else {
        const res = await getProjectRagChats(pid);

        setProjectChats(prev => ({
          ...prev,
          [pid]: res.chats || [],
        }));
      }

    } catch (err) {
      console.error("Sidebar chats error", err);
    }
  };

  // const handleProjectClick = (projectId: string) => {
  //   navigate(`/rag/project/${projectId}`);
  // };

  const handleProjectClick = (pid: string) => {
    if (isGemini) {
      navigate(`/gemini/project/${pid}`);
    } else {
      navigate(`/rag/project/${pid}`);
    }
  };

  // const handleChatClick = (projectId: string, chatId: string) => {
  //   navigate(`/rag/project/${projectId}/chat/${chatId}`);
  // };

  const handleChatClick = (
    pid: string,
    cid: string
  ) => {

    if (isGemini) {
      navigate(`/gemini/project/${pid}/chat/${cid}`);
    } else {
      navigate(`/rag/project/${pid}/chat/${cid}`);
    }
  };

  const handleDeleteChat = async (
    pid: string,
    cid: string
  ) => {

    if (!cid || !pid) return;

    try {

      if (isGemini) {
        await deleteGeminiChat(cid);

        const res = await getGeminiChats();

        const filtered = (res.chats || []).filter(
          (c: GeminiChat) => c.projectId === pid
        );

        setProjectChats(prev => ({
          ...prev,
          [pid]: filtered,
        }));

      } else {

        await deleteRagChat(cid);

        const res = await getProjectRagChats(pid);

        setProjectChats(prev => ({
          ...prev,
          [pid]: res.chats || [],
        }));
      }

      toast.success("Chat deleted");

    } catch (err) {
      toast.error("Failed to delete chat");
    }
  };
  
  const renderProjectList = (projectList: typeof projects, label: string, isPluggedSection = false) => {
    if (collapsed || projectList.length === 0) return null;
    return (
      <>
        <div className="mb-1 px-2 pt-2 pb-1">
          <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isGemini ? "text-accent/50" : "text-sidebar-foreground/30")}>
            {label}
          </span>
        </div>
        {projectList.map((project) => (
          <div key={project._id} className={"mb-1"}>
            <button
              onClick={() => {
                handleProjectClick(project._id);
                if (!expandedProjects[project._id]) toggleProject(project._id);
                // console.log("PROJECT ITEM:", project);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition-all hover:bg-sidebar-accent",
                projectId === project._id && !chatId
                  ? isGemini
                    ? "bg-accent/10 text-accent font-medium shadow-sm"
                    : "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
                  : "text-sidebar-foreground/80"
              )}
            >
              <div
                // onClick={(e) => { e.stopPropagation(); toggleProject(project._id); }}
                onClick={(e) => { e.stopPropagation(); toggleProject(project._id); }}
                className="shrink-0 rounded p-0.5 hover:bg-sidebar-accent"
              >
                {expandedProjects[project._id]
                  ? <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/40" />
                  : <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/40" />}
              </div>
              <FolderOpen className={cn("h-4 w-4 shrink-0", isGemini ? "text-accent/70" : "text-sidebar-primary/70")} />
              <span className="truncate">{project.name}</span>
              {isPluggedSection && (
                <Zap className="h-3 w-3 shrink-0 text-accent/50 ml-auto" />
              )}
            </button>
            {!collapsed && (
              <AnimatePresence>
                {expandedProjects[project._id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    {projectChats[project._id]?.map((chat) => (
                      <div
                        key={chat._id}
                        className={cn(
                          "group ml-6 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all hover:bg-sidebar-accent",
                          isGemini ? "scrollbar-thin-gemini" : "scrollbar-thin"
                        )}
                      >
                        <button
                          // onClick={() => navigate(`${basePath}/project/${project._id}/chat/${chat._id}`)}
                          onClick={() => handleChatClick(project._id, chat._id)}
                          className="flex flex-1 items-center gap-2 truncate"
                        >
                          {isGemini ? (
                            <Sparkles className="h-3 w-3 shrink-0 text-accent" />
                          ) : (
                            <MessageSquare className="h-3 w-3 shrink-0" />
                          )}
                          <span className="truncate">{chat.title}</span>
                        </button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(
                                  project._id,
                                  chat._id
                                );
                              }}
                              className="rounded p-0.5 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">Delete chat</TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                    {projectChats[project._id]?.length === 0 && (
                      <p className="ml-6 px-2 py-1.5 text-xs italic text-sidebar-foreground/30">No chats yet</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </>
    );
  };

  const renderCollapsedProjects = (projectList: typeof projects) => {
    if (!collapsed) return null;
    return projectList.map((project) => (
      <Tooltip key={project._id}>
        <TooltipTrigger asChild>
          <button
            // onClick={() => navigate(`${basePath}/project/${project._id}`)}
            onClick={() => handleProjectClick(project._id)}
            className={cn(
              "flex w-full items-center justify-center rounded-xl p-2 transition-colors hover:bg-sidebar-accent",
              projectId === project._id
                ? isGemini ? "bg-accent/10 text-accent" : "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/60"
            )}
          >
            <FolderOpen className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{project.name}</TooltipContent>
      </Tooltip>
    ));
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 56 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "flex h-[calc(100vh-4rem)] flex-col border-r overflow-hidden shrink-0",
        isGemini ? "border-accent/10 bg-sidebar" : "border-sidebar-border bg-sidebar"
      )}
    >
      {/* Top bar */}
      <div className={cn("flex items-center border-b px-3 py-3 shrink-0",
        isGemini ? "border-accent/10" : "border-sidebar-border",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 whitespace-nowrap",
                  isGemini
                    ? "text-accent hover:bg-accent/10 hover:text-accent"
                    : "text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-primary"
                )}
                onClick={() => navigate(`${basePath}/new-project`)}
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-lg p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground shrink-0"
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{collapsed ? "Expand" : "Collapse"} sidebar</TooltipContent>
        </Tooltip>
      </div>

      {/* Content */}
      <div className={cn("flex-1 overflow-y-auto px-2 py-2", isGemini ? "scrollbar-thin-gemini" : "scrollbar-thin")}>
        {isGemini ? (
          <>
            {/* Plugged Projects */}
            {renderCollapsedProjects(pluggedGeminiProjects)}
            {renderProjectList(pluggedGeminiProjects, "Plugged Projects", true)}

            {/* Gemini-native Projects */}
            {renderCollapsedProjects(nativeGeminiProjects)}
            {renderProjectList(nativeGeminiProjects, "Gemini Projects")}

            {!collapsed && pluggedGeminiProjects.length === 0 && nativeGeminiProjects.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-sidebar-foreground/40">
                No projects yet. Plug a RAG chat or create a new Gemini project.
              </p>
            )}

            {/* Standalone chats */}
            {/* {!collapsed && (
              <>
                <div className="mb-1 mt-4 px-2 pt-2 pb-1 border-t border-accent/10">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/50">Your Chats</span>
                </div>
                {geminiChats.length === 0 ? (
                  <p className="px-2 py-2 text-center text-xs text-sidebar-foreground/40">No standalone chats yet.</p>
                ) : (
                  geminiChats.map((chat) => (
                    <div
                      key={chat._id}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all hover:bg-sidebar-accent",
                        chatId === chat._id ? "bg-accent/10 text-accent font-medium" : "text-sidebar-foreground/60"
                      )}
                    >
                      <button
                        onClick={() => navigate(`/gemini/chat/${chat._id}`)}
                        className="flex flex-1 items-center gap-2 truncate"
                      >
                        <Sparkles className="h-3 w-3 shrink-0 text-accent" />
                        <span className="truncate">{chat.title}</span>
                      </button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onClick={(e) => { e.stopPropagation(); deleteGeminiStandaloneChat(chat._id); }}
                            className="rounded p-0.5 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">Delete chat</TooltipContent>
                      </Tooltip>
                    </div>
                  ))
                )}
                <div className="px-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 text-accent hover:bg-accent/10 hover:text-accent rounded-xl text-xs"
                    onClick={() => {
                      const id = addGeminiStandaloneChat(`Chat ${geminiStandaloneChats.length + 1}`);
                      navigate(`/gemini/chat/${id}`);
                    }}
                  >
                    <Plus className="h-3 w-3" /> New Chat
                  </Button>
                </div>
              </> 
            )}*/}
          </>
        ) : (
          <>
            {/* RAG Projects */}
            {renderCollapsedProjects(ragProjects)}
            {!collapsed && ragProjects.length > 0 && renderProjectList(ragProjects, "Projects")}
            {!collapsed && ragProjects.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-sidebar-foreground/40">No projects yet. Create one to get started.</p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default WorkspaceSidebar;

