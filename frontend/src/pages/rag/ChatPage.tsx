import { motion, AnimatePresence } from "framer-motion";
import { Send, FileSearch, HelpCircle, Paperclip, BookOpen, X, Zap, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

const ChatPage = () => {
  const { projectId, chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isGemini = location.pathname.startsWith("/gemini");
  const { getProjectForWorkspace, plugChatToGemini } = useWorkspace();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [citationsModal, setCitationsModal] = useState<string[] | null>(null);
  const [showPlugSuccess, setShowPlugSuccess] = useState(false);
  const project = getProjectForWorkspace(projectId!, isGemini);
  const chat = project?.chats.find((c) => c.id === chatId);

  if (!project || !chat) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-surface-foreground/50">Chat not found.</p>
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: `msg-${Date.now()}`, role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: isGemini
          ? "This is a Gemini-powered response. The model has full context of your RAG conversation and uploaded documents, enabling deeper analysis and creative exploration."
          : "This is a placeholder response. When connected to the backend, this will display citation-backed answers from your uploaded documents.",
        citations: isGemini ? undefined : ["Document 1, Page 4", "Document 2, Section 3.1", "Document 3, Abstract"],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 800);
  };

  const handlePlugToGemini = () => {
    plugChatToGemini(projectId!, chatId!);
    setShowPlugSuccess(true);
    setTimeout(() => {
      setShowPlugSuccess(false);
      // Navigate to the plugged chat in Gemini - we need to find it
      navigate(`/gemini/project/${projectId}`);
    }, 2000);
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
              <h2 className="font-heading text-xl font-bold text-hero-foreground">Chat Plugged to Gemini!</h2>
              <p className="max-w-sm text-center text-sm text-surface-foreground/60">
                A copy of this conversation has been created in the Gemini workspace. Redirecting...
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
      <div className={`flex items-center gap-3 border-b bg-surface/80 backdrop-blur-sm px-6 py-3 ${isGemini ? "border-accent/10" : "border-white/10"}`}>
        <div className={`rounded-xl p-1.5 ${accentBg}`}>
          {isGemini ? <Sparkles className={`h-4 w-4 ${accentCls}`} /> : <FileSearch className={`h-4 w-4 ${accentCls}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-sm font-semibold text-hero-foreground truncate">{chat.name}</h2>
          <p className="text-xs text-surface-foreground/40">
            {project.name} · {project.documents.length} document{project.documents.length !== 1 ? "s" : ""} indexed
            {isGemini && <span className="ml-2 text-accent">· Gemini Mode</span>}
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
              Clone this conversation to Gemini for deeper AI-powered analysis and creative exploration.
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
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className={`rounded-2xl p-4 ${isGemini ? "bg-accent/5" : "bg-surface-foreground/5"}`}>
              {isGemini
                ? <Sparkles className="h-10 w-10 text-accent/30" />
                : <FileSearch className="h-10 w-10 text-surface-foreground/15" />}
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold text-hero-foreground">
              {isGemini ? "Explore with Gemini" : "Start researching"}
            </h3>
            <p className="mt-2 max-w-md text-sm text-surface-foreground/40">
              {isGemini
                ? `Gemini has full context from your research across ${project.documents.length} document${project.documents.length !== 1 ? "s" : ""}. Ask follow-up questions, request analysis, or explore new angles.`
                : `Ask a question about your documents. The RAG engine will search through ${project.documents.length} indexed document${project.documents.length !== 1 ? "s" : ""} and return citation-backed responses.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {(isGemini
                ? ["Analyze the key themes", "Generate a summary report", "What are the implications?"]
                : ["Summarize the key findings", "What methodology was used?", "Compare the results"]
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
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
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
                    : "border border-white/10 bg-surface/90 backdrop-blur-sm text-surface-foreground/80 shadow-black/5"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {!isGemini && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2">
                    <button
                      onClick={() => setCitationsModal(msg.citations!)}
                      className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 hover:shadow-sm"
                    >
                      <BookOpen className="h-3 w-3" />
                      View {msg.citations.length} citation{msg.citations.length !== 1 ? "s" : ""}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className={`border-t bg-surface/80 backdrop-blur-sm px-6 py-4 ${isGemini ? "border-accent/10" : "border-white/10"}`}>
        <div className="mx-auto flex max-w-3xl gap-3">
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={isGemini ? "Ask Gemini anything about your research..." : "Ask a question about your documents..."}
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
        <Dialog open={!!citationsModal} onOpenChange={() => setCitationsModal(null)}>
          <DialogContent className="max-w-md border-white/10 bg-hero text-hero-foreground backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-heading">
                <BookOpen className="h-5 w-5 text-primary" /> Citations
              </DialogTitle>
              <DialogDescription className="text-surface-foreground/50">
                Sources referenced in this response
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {citationsModal?.map((cite, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-all hover:border-primary/20"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-surface-foreground/80">{cite}</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ChatPage;
