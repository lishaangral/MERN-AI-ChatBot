import { motion } from "framer-motion";
import { FolderPlus, Upload, FileText, X, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NewProject = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isGemini = location.pathname.startsWith("/gemini");
  const { addProject, addGeminiProject, addDocument } = useWorkspace();
  const basePath = isGemini ? "/gemini" : "/rag";

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const projectId = isGemini
      ? addGeminiProject(name.trim(), description.trim() || undefined)
      : addProject(name.trim(), description.trim() || undefined);
    files.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const type = ext === "pdf" ? "pdf" : ext === "docx" ? "docx" : "txt";
      addDocument(projectId, {
        name: file.name,
        type: type as "pdf" | "docx" | "txt",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    });
    navigate(`${basePath}/project/${projectId}`);
  };

  const accentCls = isGemini ? "text-accent" : "text-primary";
  const accentBg = isGemini ? "bg-accent/10" : "bg-primary/10";

  return (
    <div className="p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <div className="flex items-center gap-3">
          <div className={`rounded-2xl p-3 shadow-lg ${isGemini ? "bg-accent/10 shadow-accent/5" : "bg-primary/10 shadow-primary/5"}`}>
            {isGemini ? <Sparkles className="h-6 w-6 text-accent" /> : <FolderPlus className="h-6 w-6 text-primary" />}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-hero-foreground">
              Create New Project
            </h1>
            <p className="text-sm text-surface-foreground/50">
              {isGemini
                ? "Create a Gemini project with document context for AI-powered exploration."
                : "Define your project and upload research documents."}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="name" className="text-hero-foreground">
                Project Name
              </Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3.5 w-3.5 text-surface-foreground/40" />
                </TooltipTrigger>
                <TooltipContent>
                  Give your project a descriptive name, e.g. "ML Research Papers"
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="name"
              placeholder='e.g. "Machine Learning Research"'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`rounded-xl bg-white/5 text-hero-foreground placeholder:text-surface-foreground/30 ${isGemini ? "border-accent/10 focus:border-accent/50" : "border-white/10"}`}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="desc" className="text-hero-foreground">
                Description <span className="text-surface-foreground/40">(optional)</span>
              </Label>
            </div>
            <Input
              id="desc"
              placeholder="Brief description of this project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`rounded-xl bg-white/5 text-hero-foreground placeholder:text-surface-foreground/30 ${isGemini ? "border-accent/10 focus:border-accent/50" : "border-white/10"}`}
            />
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-hero-foreground">Upload Documents</Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3.5 w-3.5 text-surface-foreground/40" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {isGemini
                    ? "Upload documents for Gemini to use as context. PDF, DOCX, or TXT files."
                    : "Upload PDF, DOCX, or TXT files. You can add more documents later."}
                </TooltipContent>
              </Tooltip>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                dragOver
                  ? isGemini
                    ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                    : "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : isGemini
                    ? "border-accent/10 hover:border-accent/30"
                    : "border-white/10 hover:border-primary/30"
              }`}
            >
              <Upload className="h-8 w-8 text-surface-foreground/30" />
              <p className="mt-3 text-sm font-medium text-surface-foreground/60">
                Drag & drop your documents here
              </p>
              <p className="mt-1 text-xs text-surface-foreground/40">
                Supports PDF, DOCX, and TXT files
              </p>
              <label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                  }}
                />
                <span className={`mt-3 inline-block cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all hover:shadow-sm ${isGemini ? "bg-accent/10 text-accent hover:bg-accent/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                  Browse Files
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3">
              <Button
                variant={isGemini ? "default" : "hero"}
                onClick={handleCreate}
                disabled={!name.trim()}
                className={`gap-2 rounded-xl ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25" : ""}`}
              >
                {isGemini ? <Sparkles className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
                Create Project
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-surface-foreground/60 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-surface-foreground/50">{files.length} file{files.length !== 1 ? "s" : ""} selected</p>
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 transition-all hover:border-white/10"
                >
                  <div className="flex items-center gap-2 text-sm text-surface-foreground/70 min-w-0">
                    <FileText className={`h-4 w-4 shrink-0 ${isGemini ? "text-accent/60" : "text-primary/60"}`} />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-surface-foreground/40 shrink-0">
                      ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="rounded-lg p-1 text-surface-foreground/40 transition-colors hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NewProject;
