import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  FileSearch,
  HelpCircle,
  Paperclip,
  BookOpen,
  X,
  Eye,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  streamGeminiMessage,
  sendRagChatMessage,
  getRagProjectById,
  getRagDocuments,
  getRagChatById,
  getGeminiChatById,
  getGeminiProjectById,
  streamRagMessage,
  sendGeminiMessage,
  getGeminiFiles,
  plugRagChatToGemini,
} from "@/helpers/api-communicator";
import { toast } from "react-hot-toast";
import DocumentPreviewModal from "./DocumentPreviewModel";
import MarkdownMessage from "@/components/MarkdownMessage";
import { cn } from "@/lib/utils";


const ChatPage = () => {
  type Message = {
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
    citations?: Citation[];
  };

  type Chat = {
    _id: string;
    projectId: string;
    title: string;
    messages: Message[];
  };

  type Citation = {
    chunk: string;
    source?: string;
    pageNumber?: number | null;
    preview?: string;
    score?: number;
    docId?: string;
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
    size: string;
  };

  const [documents, setDocuments] = useState<Document[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // const [citations, setCitations] = useState<Citation[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  const { projectId, chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isGemini = location.pathname.startsWith("/gemini");
  const basePath = isGemini ? "/gemini" : "/rag";
  const [citationsModal, setCitationsModal] = useState<Citation[] | null>(null);
  const [showPlugSuccess, setShowPlugSuccess] = useState(false);

  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) return;
      setLoading(true);

      try {
        const res = isGemini
          ? await getGeminiChatById(chatId)
          : await getRagChatById(chatId);
        setChat(res.chat);
        setMessages(res.chat?.messages || []);

        const proj = isGemini
          ? await getGeminiProjectById(projectId!)
          : await getRagProjectById(projectId!);
        setProject(proj.project);

        const docs = isGemini
          ? await getGeminiFiles(projectId!)
          : await getRagDocuments(projectId!);
        setDocuments(isGemini ? docs.files || [] : docs.documents || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [projectId, chatId, isGemini]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // if (loading) {
  //   return (
  //     <div className="flex h-full items-center justify-center">
  //       Loading chat...
  //     </div>
  //   );
  // }

  if (!project || !chat) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-surface-foreground/50">Chat not found.</p>
      </div>
    );
  }

  //streaming
  const handleSend = async () => {
    if (!input.trim()) return;
    if (!chatId || !projectId) return;

    const userMessage = input;

    const optimisticUser = {
      role: "user" as const,
      content: userMessage,
    };

    // optimistic UI
    setMessages((prev) => [...prev, optimisticUser]);

    setInput("");
    setLoading(true);

    try {
      if (isGemini) {
        const assistantMessage = {
          role: "assistant" as const,
          content: "",
        };
        setMessages((prev) => [...prev, assistantMessage]);

        let fullText = "";

        const streamQueue: string[] = [];

        let rendering = false;

        async function processQueue() {
          if (rendering) return;

          rendering = true;

          while (streamQueue.length) {
            const chunk = streamQueue.shift() || "";
            const shouldAnimate = fullText.length < 1200;

            // FAST MODE
            if (!shouldAnimate) {
              fullText += chunk;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: fullText,
                };
                return updated;
              });
              continue;
            }

            // FIXED: Split by words, formatting sequences, or line breaks to avoid cutting Markdown tokens
            const pieces = chunk.match(/(\n+|\s+|[^\s\n]+)/g) || [];
            let index = 0;

            for (const piece of pieces) {
              fullText += piece;
              index++;

              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: fullText,
                };
                return updated;
              });

              // START SLOW
              let delay = 12;

              // SPEED UP
              if (index > 4) {
                delay = 6;
              }

              // VERY FAST
              if (index > 12) {
                delay = 2;
              }

              // PUNCTUATION PAUSE (Ignore if it's markdown symbols like * or #)
              if (/[.!?]/.test(piece) && !/[\\*#`]/.test(piece)) {
                delay += 25;
              }

              await new Promise((r) => setTimeout(r, delay));
            }
          }

          rendering = false;
        }
        await streamGeminiMessage(
          chatId,
          userMessage,

          (chunk) => {
            streamQueue.push(chunk);
            processQueue();
          },
        );

        // refresh latest chat
        const refreshed = await getGeminiChatById(chatId);
        setChat(refreshed.chat);
      }

      // RAG NORMAL
      // else {
      //   const res = await sendRagChatMessage({
      //     chatId,
      //     projectId,
      //     message: userMessage,
      //   });

      //   const botMessage = {
      //     role: "assistant" as const,
      //     content: res.answer,
      //     citations: res.citations || [],
      //   };

      //   setMessages((prev) => [...prev, botMessage]);

      //   // sync backend-updated chat
      //   setChat(res.chat);
      // }

      else {

        const assistantMessage = {

          role: "assistant" as const,

          content: "",

          citations: [],
        };

        setMessages((prev) => [
          ...prev,
          assistantMessage,
        ]);

        let fullText = "";

        const streamQueue: string[] = [];

        let rendering = false;

        async function processQueue() {

          if (rendering) return;

          rendering = true;

          while (streamQueue.length) {

            const chunk =
              streamQueue.shift() || "";

            const shouldAnimate =
              fullText.length < 1200;

            // FAST MODE
            if (!shouldAnimate) {

              fullText += chunk;

              setMessages((prev) => {

                const updated = [...prev];

                updated[
                  updated.length - 1
                ] = {

                  ...updated[
                    updated.length - 1
                  ],

                  content: fullText,
                };

                return updated;
              });

              continue;
            }

            // MARKDOWN SAFE STREAMING
            const pieces =
              chunk.match(
                /(\n+|\s+|[^\s\n]+)/g
              ) || [];

            let index = 0;

            for (const piece of pieces) {

              fullText += piece;

              index++;

              setMessages((prev) => {

                const updated = [...prev];

                updated[
                  updated.length - 1
                ] = {

                  ...updated[
                    updated.length - 1
                  ],

                  content: fullText,
                };

                return updated;
              });

              // START SLOW
              let delay = 12;

              // SPEED UP
              if (index > 4) {
                delay = 6;
              }

              // VERY FAST
              if (index > 12) {
                delay = 2;
              }

              // PUNCTUATION PAUSE
              if (
                /[.!?]/.test(piece) &&
                !/[\\*#`]/.test(piece)
              ) {
                delay += 25;
              }

              await new Promise((r) =>
                setTimeout(r, delay)
              );
            }
          }

          rendering = false;
        }

        await streamRagMessage(

          chatId,
          projectId,
          userMessage,

          (data) => {

            // TOKEN STREAM
            if (data.text) {

              streamQueue.push(
                data.text
              );

              processQueue();
            }

            // FINAL CITATIONS
            if (data.done) {

              setMessages((prev) => {

                const updated = [...prev];

                updated[
                  updated.length - 1
                ] = {

                  ...updated[
                    updated.length - 1
                  ],

                  citations:
                    data.citations || [],
                };

                return updated;
              });
            }
          }
        );

        // BACKEND SYNC
        const refreshed =
          await getRagChatById(
            chatId
          );

        setChat(refreshed.chat);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handlePlugToGemini = async () => {
    if (!projectId || !chatId) return;
    try {
      setShowPlugSuccess(true);
      const res = await plugRagChatToGemini(projectId, chatId);
      setTimeout(() => {
        setShowPlugSuccess(false);
        navigate(
          `/gemini/project/${res.geminiProjectId}/chat/${res.geminiChatId}`,
        );
      }, 1500);
    } catch (err) {
      console.error(err);

      toast.error("Failed to plug chat");
    }
  };

  const accentCls = isGemini ? "text-accent" : "text-primary";
  const accentBg = isGemini ? "bg-accent/10" : "bg-primary/10";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Plug success overlay */}
      <AnimatePresence>
        {showPlugSuccess && (
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
              className="flex flex-col items-center gap-4 rounded-3xl border border-accent/20 bg-surface p-10 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="rounded-full bg-accent/10 p-4"
              >
                <CheckCircle2 className="h-12 w-12 text-accent" />
              </motion.div>
              <h2 className="font-heading text-xl font-bold text-hero-foreground">
                Chat Plugged to Gemini!
              </h2>
              <p className="max-w-sm text-center text-sm text-surface-foreground/60">
                A copy of this conversation has been created in the Gemini
                workspace. Redirecting...
              </p>
              <div className="flex items-center gap-2 text-accent text-sm font-medium">
                <Sparkles className="h-4 w-4 animate-pulse" />
                Connecting to Gemini
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat header */}
      <div
        className={`flex items-center gap-3 border-b bg-surface/80 backdrop-blur-sm px-6 py-3 ${isGemini ? "border-accent/10" : "border-white/10"}`}
      >
        <div className={`rounded-xl p-1.5 ${accentBg}`}>
          {isGemini ? (
            <Sparkles className={`h-4 w-4 ${accentCls}`} />
          ) : (
            <FileSearch className={`h-4 w-4 ${accentCls}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-sm font-semibold text-hero-foreground truncate">
            {chat?.title || "New Chat"}
          </h2>
          <p className="text-xs text-surface-foreground/40">
            {project?.name} · {documents.length} document
            {documents.length !== 1 ? "s" : ""} indexed
            {isGemini && (
              <span className="ml-2 text-accent">· Gemini Mode</span>
            )}
          </p>
        </div>

        {/* Plug to Gemini button - only in RAG workspace */}
        {!isGemini && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handlePlugToGemini}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all bg-accent/10 text-accent hover:bg-accent/20 hover:shadow-md hover:shadow-accent/10 border border-accent/20"
              >
                <Zap className="h-3.5 w-3.5 animate-pulse" />
                Plug to Gemini
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              Clone this conversation to Gemini for deeper AI-powered analysis
              and creative exploration.
            </TooltipContent>
          </Tooltip>
        )}

        {isGemini && (
          <div className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
            <Sparkles className="h-3 w-3" />
            Gemini Powered
          </div>
        )}

        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-surface-foreground/40" />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {isGemini
              ? "You're in Gemini mode. The AI has full context from your documents for creative, open-ended exploration."
              : "Ask questions about your documents. Responses include citations so you can verify every claim."}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Messages */}
      <div
        className={cn(
          "flex-1 overflow-y-auto px-6 py-6",
          isGemini ? "scrollbar-thin-gemini" : "scrollbar-thin",
        )}
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              className={`rounded-2xl p-4 ${isGemini ? "bg-accent/5" : "bg-surface-foreground/5"}`}
            >
              {isGemini ? (
                <Sparkles className="h-10 w-10 text-accent/30" />
              ) : (
                <FileSearch className="h-10 w-10 text-surface-foreground/15" />
              )}
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold text-hero-foreground">
              {isGemini ? "Explore with Gemini" : "Start researching"}
            </h3>
            <p className="mt-2 max-w-md text-sm text-surface-foreground/40">
              {isGemini
                ? `Gemini has full context from your research across ${documents.length} document${documents.length !== 1 ? "s" : ""}. Ask follow-up questions, request analysis, or explore new angles.`
                : `Ask a question about your documents. The RAG engine will search through ${documents.length} indexed document${documents.length !== 1 ? "s" : ""} and return citation-backed responses.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {(isGemini
                ? [
                    "Analyze the key themes",
                    "Generate a summary report",
                    "What are the implications?",
                  ]
                : [
                    "Summarize the key findings",
                    "What methodology was used?",
                    "Compare the results",
                  ]
              ).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className={`rounded-full border px-4 py-2 text-xs transition-all hover:shadow-sm ${
                    isGemini
                      ? "border-accent/20 bg-accent/[0.03] text-surface-foreground/60 hover:border-accent/40 hover:text-accent hover:shadow-accent/10"
                      : "border-white/10 bg-white/[0.03] text-surface-foreground/60 hover:border-primary/30 hover:text-primary hover:shadow-primary/10"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-lg ${
                  msg.role === "user"
                    ? isGemini
                      ? "bg-accent text-accent-foreground shadow-accent/10"
                      : "bg-primary text-primary-foreground shadow-primary/10"
                    : isGemini
                      ? ""
                      : "border border-white/10 bg-surface/90 backdrop-blur-sm text-surface-foreground/80 shadow-black/5"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap"> {msg.content} </p>
                ) : (
                  <MarkdownMessage content={msg.content} />
                )}

                {!isGemini && msg.citations?.length > 0 && (
                  <div className="mt-3 pt-2 mb-4">
                    <button
                      onClick={() => setCitationsModal(msg.citations || [])}
                      className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 hover:shadow-sm"
                    >
                      <BookOpen className="h-3 w-3" />
                      View {msg.citations?.length} citation
                      {msg.citations?.length !== 1 ? "s" : ""}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className={`border-t bg-surface/80 backdrop-blur-sm px-6 py-4 ${isGemini ? "border-accent/10" : "border-white/10"}`}
      >
        <div className="mx-auto flex max-w-3xl gap-3">
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              // onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isGemini
                  ? "Ask Gemini anything about your research..."
                  : "Ask a question about your documents..."
              }
              className={`w-full rounded-2xl border bg-white/5 px-4 py-3 pr-10 text-sm text-hero-foreground placeholder:text-surface-foreground/30 focus:outline-none transition-all ${
                isGemini
                  ? "border-accent/10 focus:border-accent/50 focus:shadow-lg focus:shadow-accent/5"
                  : "border-white/10 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/5"
              }`}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-foreground/30 hover:text-primary transition-colors">
                  <Paperclip className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Attach file (coming soon)</TooltipContent>
            </Tooltip>
          </div>
          <Button
            variant={isGemini ? "default" : "hero"}
            onClick={handleSend}
            disabled={!input.trim()}
            className={`shrink-0 rounded-2xl ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25" : ""}`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Citations Modal - only for RAG */}
      {!isGemini && (
        <Dialog
          open={!!citationsModal}
          onOpenChange={() => setCitationsModal(null)}
        >
          <DialogContent className="max-w-2xl border-white/10 bg-hero text-hero-foreground backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-heading">
                <BookOpen className="h-5 w-5 text-primary" /> Citations
              </DialogTitle>
              <DialogDescription className="text-surface-foreground/50">
                Sources referenced in this response
              </DialogDescription>
            </DialogHeader>
            <div
              className={cn(
                "space-y-4 max-h-[60vh] overflow-y-auto pr-1",
                isGemini ? "scrollbar-thin-gemini" : "scrollbar-thin",
              )}
            >
              {citationsModal?.map((cite, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-4 transition-all hover:border-primary/20"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1 flex flex-col gap-1 text-sm text-surface-foreground/80">
                    {/* {cite.chunk} */}
                    <div>{cite.source || "Unknown Document"}</div>

                    <div className="text-xs text-white/50">
                      {cite.pageNumber
                        ? `Page ${cite.pageNumber}`
                        : "Page unavailable"}
                    </div>

                    <div
                    className="text-surface-foreground/70 leading-relaxed mt-1 text-[0.85rem] italic bg-black/10 rounded-lg p-2.5 border border-white/[0.02]"
                    >"{cite.preview}..."</div>

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => {
                          const doc = documents.find(
                            (d) => d.docId === cite.docId,
                          );

                          if (!doc) return;

                          setPreviewDoc(doc);

                          setPreviewPage(cite.pageNumber || 1);

                          setPreviewOpen(true);
                        }}
                        className="rounded-lg p-1.5 bg-white/[0.04] text-surface-foreground/40 hover:text-primary hover:bg-white/[0.08] transition-colors flex items-center gap-1 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
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

export default ChatPage;
