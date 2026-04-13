import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, FileText, MessageSquare, Plus, Trash2, Upload, Eye, Calendar, HelpCircle, ArrowRight, AlertTriangle, Maximize2, X, Zap, Sparkles, CheckCircle2, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isGemini = location.pathname.startsWith("/gemini");
  const { getProjectForWorkspace, deleteProject, deleteGeminiProject, deleteDocument, addChat, deleteChat, addGeminiChat, deleteGeminiChat, plugProjectToRag } = useWorkspace();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [chatsModalOpen, setChatsModalOpen] = useState(false);
  const [showPlugRagSuccess, setShowPlugRagSuccess] = useState(false);
  const project = getProjectForWorkspace(projectId!, isGemini);
  const basePath = isGemini ? "/gemini" : "/rag";
  const isGeminiNativeProject = projectId?.startsWith("gproj-");

  if (!project) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-surface-foreground/50">Project not found.</p>
      </div>
    );
  }

  const handleNewChat = () => {
    if (isGemini) {
      const chatId = addGeminiChat(project.id, `Gemini Chat ${project.chats.length + 1}`);
      navigate(`${basePath}/project/${project.id}/chat/${chatId}`);
    } else {
      const chatId = addChat(project.id, `Chat ${project.chats.length + 1}`);
      navigate(`${basePath}/project/${project.id}/chat/${chatId}`);
    }
  };

  const handleDeleteProject = () => {
    if (isGeminiNativeProject) {
      deleteGeminiProject(project.id);
    } else {
      deleteProject(project.id);
    }
    navigate(basePath);
  };

  const handlePlugProjectToRag = () => {
    setShowPlugRagSuccess(true);
    setTimeout(() => {
      plugProjectToRag(project.id);
      setShowPlugRagSuccess(false);
      navigate("/rag");
    }, 2000);
  };

  const accentCls = isGemini ? "text-accent" : "text-primary";

  const DocumentRow = ({ doc, compact = false }: { doc: typeof project.documents[0]; compact?: boolean }) => (
    <div className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-all hover:border-primary/20 hover:shadow-sm hover:shadow-primary/5">
      <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
        <FileText className="h-4 w-4 shrink-0 text-primary/60" />
        <span className="truncate text-surface-foreground/80 overflow-x-auto scrollbar-hide">{doc.name}</span>
        {!compact && <span className="text-xs text-surface-foreground/30 shrink-0">{doc.size}</span>}
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0 ml-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="rounded-lg p-1 text-surface-foreground/40 hover:text-primary transition-colors">
              <Eye className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>View document</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => deleteDocument(project.id, doc.id)}
              className="rounded-lg p-1 text-surface-foreground/40 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Delete document</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );

  const ChatRow = ({ chat }: { chat: typeof project.chats[0] }) => (
    <div className={`group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-all ${isGemini ? "hover:border-accent/20 hover:shadow-sm hover:shadow-accent/5" : "hover:border-accent/20 hover:shadow-sm hover:shadow-accent/5"}`}>
      <button
        onClick={() => navigate(`${basePath}/project/${project.id}/chat/${chat.id}`)}
        className="flex flex-1 items-center gap-2 text-sm text-surface-foreground/80 min-w-0"
      >
        {isGemini ? (
          <Sparkles className="h-4 w-4 shrink-0 text-accent/60" />
        ) : (
          <MessageSquare className="h-4 w-4 shrink-0 text-accent/60" />
        )}
        <span className="truncate overflow-x-auto scrollbar-hide">{chat.name}</span>
        <ArrowRight className="ml-auto h-3.5 w-3.5 text-surface-foreground/30 opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
      </button>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              if (isGemini) {
                deleteGeminiChat(project.id, chat.id);
              } else {
                deleteChat(project.id, chat.id);
              }
            }}
            className="ml-2 rounded-lg p-1 text-surface-foreground/40 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Delete chat</TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <div className="p-6 md:p-10">
      {/* Plug to RAG success overlay */}
      <AnimatePresence>
        {showPlugRagSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-hero-bg/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4 rounded-3xl border border-primary/20 bg-surface p-10 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="rounded-full bg-primary/10 p-4"
              >
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </motion.div>
              <h2 className="font-heading text-xl font-bold text-hero-foreground">Project Plugged to RAG!</h2>
              <p className="max-w-sm text-center text-sm text-surface-foreground/60">
                Your project and documents have been recreated in the RAG workspace. Redirecting...
              </p>
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <BookOpen className="h-4 w-4 animate-pulse" />
                Connecting to RAG Workspace
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl p-3 shadow-lg ${isGemini ? "bg-accent/10 shadow-accent/5" : "bg-primary/10 shadow-primary/5"}`}>
              <FolderOpen className={`h-6 w-6 ${accentCls}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-hero-foreground">{project.name}</h1>
                {isGemini && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">Gemini</span>
                )}
              </div>
              {project.description && (
                <p className="mt-0.5 text-sm text-surface-foreground/50">{project.description}</p>
              )}
              <p className="mt-1 flex items-center gap-1 text-xs text-surface-foreground/40">
                <Calendar className="h-3 w-3" />
                Created {project.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {isGeminiNativeProject && isGemini && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-xl text-primary hover:bg-primary/10 hover:text-primary border border-primary/20"
                    onClick={handlePlugProjectToRag}
                  >
                    <Zap className="h-4 w-4" /> Plug to RAG
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Recreate this project in the RAG workspace with the same documents. Chats will not be copied.
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              variant={isGemini ? "default" : "hero"}
              size="sm"
              className={`gap-2 rounded-xl ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25" : ""}`}
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4" /> New Chat
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive/60 hover:text-destructive rounded-xl"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete project</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Delete confirmation */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 shadow-lg shadow-destructive/5"
            >
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="flex-1 text-sm text-hero-foreground">
                Delete <strong>{project.name}</strong>? This removes all documents and chats permanently.
              </p>
              <Button variant="destructive" size="sm" className="rounded-xl" onClick={handleDeleteProject}>
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)} className="text-surface-foreground/60 rounded-xl">
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Documents Card */}
          <div className="rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-sm p-6 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-semibold text-hero-foreground">Documents</h2>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-surface-foreground/40" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    {isGemini
                      ? "Documents shared across both workspaces. Gemini has full context of these files."
                      : "Documents indexed for citation-backed search in this project."}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1">
                {project.documents.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setDocsModalOpen(true)}
                        className="rounded-lg p-1.5 text-surface-foreground/40 hover:text-primary transition-colors"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>View all documents</TooltipContent>
                  </Tooltip>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1 rounded-xl ${accentCls}`}
                  onClick={() => navigate(`${basePath}/project/${project.id}/upload`)}
                >
                  <Upload className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>

            {project.documents.length === 0 ? (
              <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <FileText className="h-8 w-8 text-surface-foreground/20" />
                <p className="mt-2 text-sm text-surface-foreground/50">No documents uploaded yet.</p>
                <Button
                  variant={isGemini ? "default" : "hero"}
                  size="sm"
                  className={`mt-3 gap-2 rounded-xl ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                  onClick={() => navigate(`${basePath}/project/${project.id}/upload`)}
                >
                  <Upload className="h-4 w-4" /> Upload Documents
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                {project.documents.map((doc) => (
                  <DocumentRow key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>

          {/* Chats Card */}
          <div className="rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-sm p-6 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-semibold text-hero-foreground">Chats</h2>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-surface-foreground/40" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    {isGemini
                      ? "Chats powered by Gemini with full context from your documents and research."
                      : "Each chat is a separate conversation grounded in this project's documents. Plug any chat to Gemini for deeper exploration."}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1">
                {project.chats.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setChatsModalOpen(true)}
                        className={`rounded-lg p-1.5 text-surface-foreground/40 transition-colors ${isGemini ? "hover:text-accent" : "hover:text-primary"}`}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>View all chats</TooltipContent>
                  </Tooltip>
                )}
                <Button variant="ghost" size="sm" className={`gap-1 rounded-xl ${accentCls}`} onClick={handleNewChat}>
                  <Plus className="h-4 w-4" /> New Chat
                </Button>
              </div>
            </div>

            {project.chats.length === 0 ? (
              <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <MessageSquare className="h-8 w-8 text-surface-foreground/20" />
                <p className="mt-2 text-sm text-surface-foreground/50">No chats yet.</p>
                <Button
                  variant={isGemini ? "default" : "hero"}
                  size="sm"
                  className={`mt-3 gap-2 rounded-xl ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                  onClick={handleNewChat}
                >
                  <Plus className="h-4 w-4" /> Start Chat
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                {project.chats.map((chat) => (
                  <ChatRow key={chat.id} chat={chat} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-lg shadow-black/5"
        >
          <h3 className="flex items-center gap-2 font-heading text-sm font-semibold text-hero-foreground">
            {isGemini ? <Sparkles className="h-4 w-4 text-accent" /> : <HelpCircle className="h-4 w-4 text-primary" />}
            {isGemini ? "Gemini Workspace" : "How it works"}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(isGemini ? [
              { step: "1. Context", desc: "Gemini has full access to your documents and prior conversations from RAG research." },
              { step: "2. Explore", desc: "Ask deeper questions, request analysis, or explore creative angles your research uncovered." },
              { step: "3. Create", desc: "Generate summaries, reports, or insights combining multiple document contexts." },
            ] : [
              { step: "1. Upload", desc: "Add PDF, DOCX, or TXT files. They'll be indexed and ready for search." },
              { step: "2. Ask", desc: "Start a chat and ask questions. Responses cite your documents directly." },
              { step: "3. Extend", desc: "Plug any chat to Gemini to continue with AI-powered creative exploration." },
            ]).map((item) => (
              <div key={item.step} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 shadow-sm">
                <span className={`text-xs font-bold ${accentCls}`}>{item.step}</span>
                <p className="mt-1 text-xs text-surface-foreground/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Documents Modal */}
      <Dialog open={docsModalOpen} onOpenChange={setDocsModalOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-hero text-hero-foreground backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading">
              <FileText className="h-5 w-5 text-primary" /> All Documents
            </DialogTitle>
            <DialogDescription className="text-surface-foreground/50">
              {project.documents.length} document{project.documents.length !== 1 ? "s" : ""} in {project.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {project.documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="hero"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={() => {
                setDocsModalOpen(false);
                navigate(`${basePath}/project/${project.id}/upload`);
              }}
            >
              <Upload className="h-4 w-4" /> Upload More
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chats Modal */}
      <Dialog open={chatsModalOpen} onOpenChange={setChatsModalOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-hero text-hero-foreground backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading">
              {isGemini ? <Sparkles className="h-5 w-5 text-accent" /> : <MessageSquare className="h-5 w-5 text-primary" />} All Chats
            </DialogTitle>
            <DialogDescription className="text-surface-foreground/50">
              {project.chats.length} chat{project.chats.length !== 1 ? "s" : ""} in {project.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {project.chats.map((chat) => (
              <ChatRow key={chat.id} chat={chat} />
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant={isGemini ? "default" : "hero"}
              size="sm"
              className={`gap-2 rounded-xl ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
              onClick={() => {
                setChatsModalOpen(false);
                handleNewChat();
              }}
            >
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectPage;
