import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Plus, PanelLeftClose, PanelLeft, FolderOpen, MessageSquare, Trash2, ChevronRight, ChevronDown, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspace";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface WorkspaceSidebarProps {
  workspaceType: "rag" | "chat";
}

const WorkspaceSidebar = ({ workspaceType }: WorkspaceSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(["proj-1", "proj-2"]));
  const {
    projects, geminiProjects, deleteChat, getPluggedProjects, geminiStandaloneChats,
    deleteGeminiStandaloneChat, addGeminiStandaloneChat, deleteGeminiChat,
  } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, chatId } = useParams();
  const basePath = workspaceType === "rag" ? "/rag" : "/gemini";
  const isGemini = workspaceType === "chat";

  const pluggedProjects = isGemini ? getPluggedProjects() : [];
  const ragProjects = isGemini ? [] : projects;

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
          <div key={project.id} className="mb-1">
            <button
              onClick={() => {
                navigate(`${basePath}/project/${project.id}`);
                if (!expandedProjects.has(project.id)) toggleProject(project.id);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition-all hover:bg-sidebar-accent",
                projectId === project.id && !chatId
                  ? isGemini
                    ? "bg-accent/10 text-accent font-medium shadow-sm"
                    : "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
                  : "text-sidebar-foreground/80"
              )}
            >
              <div
                onClick={(e) => { e.stopPropagation(); toggleProject(project.id); }}
                className="shrink-0 rounded p-0.5 hover:bg-sidebar-accent"
              >
                {expandedProjects.has(project.id)
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
                {expandedProjects.has(project.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    {project.chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={cn(
                          "group ml-6 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all hover:bg-sidebar-accent",
                          chatId === chat.id
                            ? isGemini
                              ? "bg-accent/10 text-accent font-medium"
                              : "bg-sidebar-accent/80 text-sidebar-primary font-medium"
                            : "text-sidebar-foreground/60"
                        )}
                      >
                        <button
                          onClick={() => navigate(`${basePath}/project/${project.id}/chat/${chat.id}`)}
                          className="flex flex-1 items-center gap-2 truncate"
                        >
                          {isGemini ? (
                            <Sparkles className="h-3 w-3 shrink-0 text-accent" />
                          ) : (
                            <MessageSquare className="h-3 w-3 shrink-0" />
                          )}
                          <span className="truncate">{chat.name}</span>
                        </button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isGemini) {
                                  deleteGeminiChat(project.id, chat.id);
                                } else {
                                  deleteChat(project.id, chat.id);
                                }
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
                    {project.chats.length === 0 && (
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
      <Tooltip key={project.id}>
        <TooltipTrigger asChild>
          <button
            onClick={() => navigate(`${basePath}/project/${project.id}`)}
            className={cn(
              "flex w-full items-center justify-center rounded-xl p-2 transition-colors hover:bg-sidebar-accent",
              projectId === project.id
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
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {isGemini ? (
          <>
            {/* Plugged Projects */}
            {renderCollapsedProjects(pluggedProjects)}
            {renderProjectList(pluggedProjects, "Plugged Projects", true)}

            {/* Gemini-native Projects */}
            {renderCollapsedProjects(geminiProjects)}
            {renderProjectList(geminiProjects, "Gemini Projects")}

            {!collapsed && pluggedProjects.length === 0 && geminiProjects.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-sidebar-foreground/40">
                No projects yet. Plug a RAG chat or create a new Gemini project.
              </p>
            )}

            {/* Standalone chats */}
            {!collapsed && (
              <>
                <div className="mb-1 mt-4 px-2 pt-2 pb-1 border-t border-accent/10">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/50">Your Chats</span>
                </div>
                {geminiStandaloneChats.length === 0 ? (
                  <p className="px-2 py-2 text-center text-xs text-sidebar-foreground/40">No standalone chats yet.</p>
                ) : (
                  geminiStandaloneChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all hover:bg-sidebar-accent",
                        chatId === chat.id ? "bg-accent/10 text-accent font-medium" : "text-sidebar-foreground/60"
                      )}
                    >
                      <button
                        onClick={() => navigate(`/gemini/chat/${chat.id}`)}
                        className="flex flex-1 items-center gap-2 truncate"
                      >
                        <Sparkles className="h-3 w-3 shrink-0 text-accent" />
                        <span className="truncate">{chat.name}</span>
                      </button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onClick={(e) => { e.stopPropagation(); deleteGeminiStandaloneChat(chat.id); }}
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
            )}
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

