import { motion } from "framer-motion";
import { FolderPlus, Clock, FileSearch, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";

const RagLanding = () => {
  const navigate = useNavigate();
  const { projects } = useWorkspace();
  const recentProject = projects[0];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 inline-flex rounded-2xl bg-primary/10 p-4">
            <FileSearch className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-hero-foreground">
            RAG Workspace
          </h1>
          <p className="mx-auto mt-3 max-w-md text-surface-foreground/60">
            Upload your research documents and get citation-backed, fact-grounded responses. No hallucinations — only answers from your content.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-foreground/40">
            <Zap className="h-3 w-3 text-accent" />
            <span>Plug any chat to Gemini for AI-powered creative exploration</span>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {/* Create New */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/rag/new-project")}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-surface p-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
              <FolderPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-hero-foreground">
                Create New Project
              </h3>
              <p className="mt-1 text-sm text-surface-foreground/50">
                Start a new research project and upload your documents.
              </p>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Get started <ArrowRight className="h-4 w-4" />
            </span>
          </motion.button>

          {/* Open Recent */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (recentProject) navigate(`/rag/project/${recentProject.id}`);
              else navigate("/rag/new-project");
            }}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface p-8 text-center transition-colors hover:border-white/20"
          >
            <div className="rounded-xl bg-white/5 p-3 transition-colors group-hover:bg-white/10">
              <Clock className="h-8 w-8 text-surface-foreground/60" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-hero-foreground">
                Open Recent Project
              </h3>
              <p className="mt-1 text-sm text-surface-foreground/50">
                {recentProject
                  ? `Continue working on "${recentProject.name}"`
                  : "No recent projects. Create one to get started."}
              </p>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-surface-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RagLanding;
