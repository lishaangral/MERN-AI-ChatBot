import { motion } from "framer-motion";
import { Send, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const GeminiStandaloneChat = () => {
  const { chatId } = useParams();
  const { geminiStandaloneChats } = useWorkspace();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const chat = geminiStandaloneChats.find((c) => c.id === chatId);

  if (!chat) {
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
        content: "This is a Gemini-powered response. When connected to the backend, this will provide intelligent, context-aware answers powered by Google Gemini.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 800);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-accent/10 bg-surface/80 backdrop-blur-sm px-6 py-3">
        <div className="rounded-xl bg-accent/10 p-1.5">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-sm font-semibold text-hero-foreground">{chat.name}</h2>
          <p className="text-xs text-surface-foreground/40">Standalone Gemini conversation</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
          <Sparkles className="h-3 w-3" />
          Gemini
        </div>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-surface-foreground/40" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            A standalone Gemini conversation — no documents attached. Perfect for brainstorming, analysis, and open-ended exploration.
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-accent/5 p-4">
              <Sparkles className="h-10 w-10 text-accent/30" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold text-hero-foreground">
              Chat with Gemini
            </h3>
            <p className="mt-2 max-w-md text-sm text-surface-foreground/40">
              Start a conversation with Gemini. Ask questions, brainstorm ideas, or explore any topic.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Explain quantum computing", "Help me brainstorm ideas", "Write a summary of..."].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-full border border-accent/20 bg-accent/[0.03] px-4 py-2 text-xs text-surface-foreground/60 transition-all hover:border-accent/40 hover:text-accent hover:shadow-sm hover:shadow-accent/10"
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
                    ? "bg-accent text-accent-foreground shadow-accent/10"
                    : "border border-white/10 bg-surface/90 backdrop-blur-sm text-surface-foreground/80 shadow-black/5"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-accent/10 bg-surface/80 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-3xl gap-3">
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask Gemini anything..."
              className="w-full rounded-2xl border border-accent/10 bg-white/5 px-4 py-3 text-sm text-hero-foreground placeholder:text-surface-foreground/30 focus:border-accent/50 focus:outline-none focus:shadow-lg focus:shadow-accent/5 transition-all"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeminiStandaloneChat;
