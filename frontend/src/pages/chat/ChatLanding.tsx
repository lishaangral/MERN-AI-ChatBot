import { motion } from "framer-motion";
import { MessageSquare, FolderPlus, Clock, ArrowRight, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";

const ChatLanding = () => {
  const navigate = useNavigate();
  const { getPluggedProjects, addGeminiStandaloneChat, geminiStandaloneChats, geminiProjects } = useWorkspace();
  const allGeminiProjects = [...getPluggedProjects(), ...geminiProjects];
  const recentProject = allGeminiProjects[0];

  const handleNewStandaloneChat = () => {
    const chatId = addGeminiStandaloneChat(`Chat ${geminiStandaloneChats.length + 1}`);
    navigate(`/gemini/chat/${chatId}`);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="text-center">
          <div className="mx-auto mb-6 inline-flex rounded-2xl bg-accent/10 p-4">
            <Sparkles className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-hero-foreground">Gemini Chat</h1>
          <p className="mx-auto mt-3 max-w-md text-surface-foreground/60">
            AI conversation powered by Google Gemini. Extend your RAG research with deeper analysis, or start fresh standalone conversations.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-foreground/40">
            <Zap className="h-3 w-3 text-accent" />
            <span>Plug any RAG chat here for seamless AI-powered exploration</span>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/gemini/new-project")}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-accent/20 bg-surface p-6 text-center transition-colors hover:border-accent/50 hover:bg-accent/5"
          >
            <div className="rounded-xl bg-accent/10 p-3 transition-colors group-hover:bg-accent/20">
              <FolderPlus className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-hero-foreground">New Project</h3>
              <p className="mt-1 text-xs text-surface-foreground/50">Create with documents for context.</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Create <ArrowRight className="h-3 w-3" />
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewStandaloneChat}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-accent/20 bg-surface p-6 text-center transition-colors hover:border-accent/50 hover:bg-accent/5"
          >
            <div className="rounded-xl bg-accent/10 p-3 transition-colors group-hover:bg-accent/20">
              <MessageSquare className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-hero-foreground">Quick Chat</h3>
              <p className="mt-1 text-xs text-surface-foreground/50">Start a simple AI conversation.</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Start <ArrowRight className="h-3 w-3" />
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (recentProject) navigate(`/gemini/project/${recentProject.id}`);
              else navigate("/gemini/new-project");
            }}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface p-6 text-center transition-colors hover:border-white/20"
          >
            <div className="rounded-xl bg-white/5 p-3 transition-colors group-hover:bg-white/10">
              <Clock className="h-7 w-7 text-surface-foreground/60" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-hero-foreground">Recent</h3>
              <p className="mt-1 text-xs text-surface-foreground/50">
                {recentProject ? `"${recentProject.name}"` : "No recent sessions."}
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-surface-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
              Open <ArrowRight className="h-3 w-3" />
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatLanding;
