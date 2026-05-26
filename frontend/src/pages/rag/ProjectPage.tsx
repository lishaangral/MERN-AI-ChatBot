import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, FileText, MessageSquare, Plus, Trash2, Upload, Eye, Calendar, HelpCircle, ArrowRight, AlertTriangle, Maximize2, X, Zap, Sparkles, CheckCircle2, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { plugGeminiProjectToRag, deleteGeminiProject, createRagChatAPI, deleteRagChat, deleteRagProject, deleteRagDocument, getProjectRagChats, getRagChatById, getRagDocuments, getRagProjectById, getGeminiProjectById, getGeminiChats, createGeminiChatAPI, getGeminiChatById, deleteGeminiChat, getGeminiFiles, deleteGeminiFile } from "@/helpers/api-communicator";
import { toast } from "react-hot-toast";
import DocumentPreviewModal from "./DocumentPreviewModel";
import { cn } from "@/lib/utils";

const ProjectPage = () => {

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

  type Document = {
    docId: string;
    filename: string;
    fileUrl: string;
    uploadedAt: string;
    size: number;
  };

  type GeminiChat = {
    _id: string;
    title: string;
    projectId?: string;
    chatType: "standalone" | "project" | "plugged";
    createdAt: string;
    updatedAt: string;
  };

  type GeminiDocument = {
    _id: string;
    filename: string;
    fileUrl: string;
    uploadedAt: string;
    size: number;
  };

  type GeminiProject = {
    _id: string;
    name: string;
    projectType: "native" | "plugged";
    createdAt: string;
    updatedAt: string;
  };

  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isGemini = location.pathname.startsWith("/gemini");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [chatsModalOpen, setChatsModalOpen] = useState(false);
  const [showPlugRagSuccess, setShowPlugRagSuccess] = useState(false);
  const basePath = isGemini ? "/gemini" : "/rag";

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [allFilesEmbedded, setAllFilesEmbedded] = useState(false);
  const [ragProjectId, setRagProjectId] = useState("");

  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState<number>(1);

  useEffect(() => {

    const loadAll = async () => {
      if (!projectId) return;

      try {
        setLoading(true);

          // 1. PROJECT
          const proj = isGemini
            ? await getGeminiProjectById(projectId!)
            : await getRagProjectById(projectId!);
          setProject(proj.project);
          setRagProjectId(proj.project.pluggedRagProjectId || "");

          if (isGemini) {
            setAllFilesEmbedded(
              proj.allFilesEmbedded || false
            );
          }

          // 2. DOCUMENTS
          const res = isGemini
            ? await getGeminiFiles(projectId!)
            : await getRagDocuments(projectId!);
            
          if (isGemini) {
            const docs =
              (res.files || []).map(
                (f: GeminiDocument) => ({
                  docId: f._id,
                  filename: f.filename,
                  fileUrl: f.fileUrl,
                  size: f.size,
                  uploadedAt: f.uploadedAt,
                })
              );
            setDocuments(docs);
          } else {
            setDocuments(
              res.documents || []
            );
          }

          // 3. CHATS
          const chatsRes = isGemini
            ? await getGeminiChats()
            : await getProjectRagChats(projectId!);
          const chatsList = isGemini
            ? (chatsRes.chats || []).filter(
                (c: GeminiChat) =>
                  c.projectId === projectId
              )
            : chatsRes.chats || [];
          setChats(chatsList);

          // 4. AUTO SELECT FIRST CHAT
          if (chatsList.length > 0) {
            const first = await getRagChatById(chatsList[0]._id);
            // setActiveChat(first.chat);
        }

      } catch (err) {
        console.error("LOAD ERROR", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [projectId, isGemini]);

  // if (!project) {
  //   return (
  //     <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
  //       <p className="text-surface-foreground/50">Project not found.</p>
  //     </div>
  //   );
  // }

  if (loading)  {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-surface-foreground/50">Loading...</p>
      </div>
    );
  }

  const handleCreateChat = async () => {
    try {
      const res = isGemini
        ? await createGeminiChatAPI({
            projectId,
            title: "New Chat",
            chatType: "project",
          })
        : await createRagChatAPI(
            projectId!, "rag", "New Chat");
      const chatId = res.chat._id;
      if (!chatId) {
        toast.error("Failed to create chat");
        return;
      }
      const newChat = res.chat;

      setChats((prev) => [newChat, ...prev]);
      // setActiveChat(newChat);

      navigate(`${basePath}/project/${project._id}/chat/${chatId}`);

    } catch (err) {
      console.error("CREATE CHAT ERROR", err);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    const res = isGemini
      ? await getGeminiChatById(chatId)
      : await getRagChatById(chatId);
    // setActiveChat(res.chat);
  };


  const handleDeleteChat = async (chatId: string) => {
    if (!chatId || !projectId) return;

    try {
        if (isGemini) {
            await deleteGeminiChat(chatId);
        } else {
            await deleteRagChat(chatId);
        }

      toast.success("Chat deleted");

      // navigate(`/rag/project/${projectId}`);
      setChats((prev) => prev.filter((c) => c._id !== chatId));

    } catch (err) {
      toast.error("Failed to delete chat");
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (isGemini) {
      await deleteGeminiFile(docId);
    } else {
      await deleteRagDocument(docId);
    }
    toast.success("Document deleted");
    setDocuments((prev) =>
      prev.filter((d) => d.docId !== docId)
    );
  };

  const handleDeleteProject = () => {
    if (isGemini) {
      deleteGeminiProject(project._id);
    } else {
      deleteRagProject(project._id);
    }
    toast.success("Project deleted");
    navigate(basePath);
  };

const handlePlugProjectToRag = async () => {
    if (!projectId) return;
    try {
      setShowPlugRagSuccess(true);
      const res = await plugGeminiProjectToRag(projectId);
      setAllFilesEmbedded(true);
      setTimeout(() => {
        setShowPlugRagSuccess(false);
        navigate(`/rag/project/${res.ragProjectId}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setShowPlugRagSuccess(false);
      toast.error("Failed to sync to RAG");
    }
  };

  const accentCls = isGemini ? "text-accent" : "text-primary";

  const DocumentRow = ({ doc, compact = false }: { doc: typeof documents[0]; compact?: boolean }) => (
    <div className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-all hover:border-primary/20 hover:shadow-sm hover:shadow-primary/5">
      <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
        <FileText className="h-4 w-4 shrink-0 text-primary/60" />
        <span className="truncate text-surface-foreground/80 overflow-x-auto scrollbar-hide">{doc.filename}</span>
        {!compact && <span className="text-xs text-surface-foreground/30 shrink-0">({(doc.size / (1024 * 1024)).toFixed(1)} MB)</span>}
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0 ml-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
            onClick={() => {
              setPreviewDoc(doc);
              setPreviewPage(1);
              setPreviewOpen(true);
            }}
            className="rounded-lg p-1 text-surface-foreground/40 hover:text-primary transition-colors">
              <Eye className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>View document</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleDeleteDoc(doc.docId)}
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

  const ChatRow = ({ chat }: { chat: typeof chats[0] }) => (
    <div className={`group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-all ${isGemini ? "hover:border-accent/20 hover:shadow-sm hover:shadow-accent/5" : "hover:border-accent/20 hover:shadow-sm hover:shadow-accent/5"}`}>
      <button
        onClick={() => navigate(`${basePath}/project/${project._id}/chat/${chat._id}`)}
        className="flex flex-1 items-center gap-2 text-sm text-surface-foreground/80 min-w-0"
      >
        {isGemini ? (
          <Sparkles className="h-4 w-4 shrink-0 text-accent/60" />
        ) : (
          <MessageSquare className="h-4 w-4 shrink-0 text-accent/60" />
        )}
        <span className="truncate overflow-x-auto scrollbar-hide">{chat.title}</span>
        <ArrowRight className="ml-auto h-3.5 w-3.5 text-surface-foreground/30 opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
      </button>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              handleDeleteChat(chat._id);
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
                <h1 className="font-heading text-2xl font-bold text-hero-foreground">{project?.name}</h1>
                {isGemini && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">Gemini</span>
                )}
              </div>
              {project.description && (
                <p className="mt-0.5 text-sm text-surface-foreground/50">{project.description}</p>
              )}
              <p className="mt-1 flex items-center gap-1 text-xs text-surface-foreground/40">
                <Calendar className="h-3 w-3" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {isGemini && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-xl text-primary hover:bg-primary/10 hover:text-primary border border-primary/20"
                    onClick={
                      (allFilesEmbedded ? () => navigate(`/rag/project/${ragProjectId}`) : handlePlugProjectToRag)
                    }
                  >
                    <Zap className="h-4 w-4" /> {allFilesEmbedded ? "Open in RAG Workspace" : "Plug to RAG"}
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
              onClick={handleCreateChat}
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
                Delete <strong>{project.name}</strong>? This removes all chats and documents not plugged into RAG Workspace permanently.
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
                {documents?.length > 0 && (
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
                  onClick={() => navigate(`${basePath}/project/${project._id}/upload`)}
                >
                  <Upload className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>

            {documents?.length === 0 ? (
              <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <FileText className="h-8 w-8 text-surface-foreground/20" />
                <p className="mt-2 text-sm text-surface-foreground/50">No documents uploaded yet.</p>
                <Button
                  variant={isGemini ? "default" : "hero"}
                  size="sm"
                  className={`mt-3 gap-2 rounded-xl ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                  onClick={() => navigate(`${basePath}/project/${project._id}/upload`)}
                >
                  <Upload className="h-4 w-4" /> Upload Documents
                </Button>
              </div>
            ) : (
              <div className={cn("mt-4 space-y-2 max-h-52 overflow-y-auto pr-1", isGemini ? "scrollbar-thin-gemini" : "scrollbar-thin scrollbar-thumb-white/20")}>
                {documents?.map((doc) => (
                  <DocumentRow key={doc.docId} doc={doc} />
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
                {chats?.length > 0 && (
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
                <Button variant="ghost" size="sm" className={`gap-1 rounded-xl ${accentCls}`} onClick={handleCreateChat}>
                  <Plus className="h-4 w-4" /> New Chat
                </Button>
              </div>
            </div>

            {chats?.length === 0 ? (
              <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <MessageSquare className="h-8 w-8 text-surface-foreground/20" />
                <p className="mt-2 text-sm text-surface-foreground/50">No chats yet.</p>
                <Button
                  variant={isGemini ? "default" : "hero"}
                  size="sm"
                  className={`mt-3 gap-2 rounded-xl ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                  onClick={handleCreateChat}
                >
                  <Plus className="h-4 w-4" /> Start Chat
                </Button>
              </div>
            ) : (
              <div className={cn("mt-4 space-y-2 max-h-52 overflow-y-auto pr-1", isGemini ? "scrollbar-thin-gemini" : "scrollbar-thin scrollbar-thumb-white/20")}>
                {chats?.map((chat) => (
                  <ChatRow key={chat._id} chat={chat} />
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
              {documents?.length} document{documents?.length !== 1 ? "s" : ""} in {project.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {documents?.map((doc) => (
              <DocumentRow key={doc.docId} doc={doc} />
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="hero"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={() => {
                setDocsModalOpen(false);
                navigate(`${basePath}/project/${project._id}/upload`);
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
              {chats?.length} chat{chats?.length !== 1 ? "s" : ""} in {project.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {chats?.map((chat) => (
              <ChatRow key={chat._id} chat={chat} />
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant={isGemini ? "default" : "hero"}
              size="sm"
              className={`gap-2 rounded-xl ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
              onClick={() => {
                setChatsModalOpen(false);
                handleCreateChat();
              }}
            >
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DocumentPreviewModal
        isGemini={isGemini}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={previewDoc}
        pageNumber={previewPage}
      />
    </div>
  );
};

export default ProjectPage;
