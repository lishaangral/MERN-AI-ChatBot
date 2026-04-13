import { useState } from "react";
import { motion } from "framer-motion";
import { FileSearch, MessageSquare, ArrowRight, Brain, HelpCircle, BookOpen, Sparkles, Zap, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "@/helpers/api-communicator";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const auth = useAuth();

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      // force logout state in frontend
      auth?.logout();  
      toast.success("Account deleted successfully");
      navigate("/"); // redirect to home
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="bg-hero min-h-screen pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-hero-foreground">
            Welcome to your Dashboard
          </h1>
          <p className="mt-1 text-surface-foreground/70">
            Choose a workspace to get started, or explore the tools below.
          </p>
        </motion.div>

        {/* RAG → Gemini Pipeline Feature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-2xl border border-white/5 bg-surface p-6"
        >
          <div className="flex items-start gap-4">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-3">
              <Brain className="h-6 w-6 text-hero-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg font-semibold text-hero-foreground">
                RAG → Gemini Pipeline
              </h3>
              <p className="mt-1 text-sm text-surface-foreground/70">
                Bridge your document-grounded research with AI exploration. Start in RAG to uncover facts with citations, then plug any chat into Gemini for deeper analysis and brainstorming.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-s text-primary">
                  <FileSearch className="h-4 w-4" />
                  Search &amp; cite in RAG
                </div>
                <div className="flex items-center gap-1.5 text-surface-foreground/30">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-s text-accent">
                  <Zap className="h-4 w-4" />
                  Plug to Gemini
                </div>
                <div className="flex items-center gap-1.5 text-surface-foreground/30">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-s text-accent">
                  <Sparkles className="h-4 w-4" />
                  Explore with AI
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* RAG */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate("/rag")}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-surface p-6 transition-all hover:border-primary/30 hover:glow-border"
          >
            <div className="flex items-start justify-between">
              <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <FileSearch className="h-6 w-6" />
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-surface-foreground/40" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  Upload research documents and get citation-backed responses.
                </TooltipContent>
              </Tooltip>
            </div>
            <h3 className="mt-4 font-heading text-xl font-semibold text-hero-foreground">RAG Workspace</h3>
            <p className="mt-2 text-sm text-surface-foreground/70">
              Upload documents and receive citation-backed, fact-grounded responses.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Open workspace <ArrowRight className="h-4 w-4" />
            </div>
          </motion.div>

          {/* Gemini Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate("/gemini")}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-surface p-6 transition-all hover:border-accent/30 hover:glow-border-purple"
          >
            <div className="flex items-start justify-between">
              <div className="inline-flex rounded-xl bg-accent/10 p-3 text-accent">
                <MessageSquare className="h-6 w-6" />
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-surface-foreground/40" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  Chat with Google Gemini AI for open-ended questions and brainstorming.
                </TooltipContent>
              </Tooltip>
            </div>
            <h3 className="mt-4 font-heading text-xl font-semibold text-hero-foreground">Gemini Chat</h3>
            <p className="mt-2 text-sm text-surface-foreground/70">
              Open-ended AI conversation powered by Google Gemini API.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Open chat <ArrowRight className="h-4 w-4" />
            </div>
          </motion.div>
        </div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-2xl border border-white/5 bg-surface p-6"
        >
          <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-hero-foreground">
            <BookOpen className="h-5 w-5 text-primary" /> Quick Start Guide
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <span className="text-xs font-bold text-primary">Step 1</span>
              <p className="mt-1 text-sm text-surface-foreground/70">
                Open <strong>RAG Workspace</strong> and upload your research documents.
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <span className="text-xs font-bold text-primary">Step 2</span>
              <p className="mt-1 text-sm text-surface-foreground/70">
                Ask questions and get <strong>citation-backed responses</strong>.
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <span className="text-xs font-bold text-primary">Step 3</span>
              <p className="mt-1 text-sm text-surface-foreground/70">
                <strong>Plug to Gemini</strong> to explore ideas further with AI.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex justify-center border-t border-white/5 pt-8"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-surface">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-hero-foreground">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-surface-foreground/70">
                  This action cannot be undone. This will permanently delete your account, all projects, uploaded documents, and chat history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 bg-white/5 text-hero-foreground hover:bg-white/10">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
