import { motion } from "framer-motion";
import { Upload, FileText, X, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const UploadDocuments = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isGemini = location.pathname.startsWith("/gemini");
  const { getProjectForWorkspace, addDocument } = useWorkspace();
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const project = getProjectForWorkspace(projectId!, isGemini);
  const basePath = isGemini ? "/gemini" : "/rag";

  if (!project) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-surface-foreground/50">Project not found.</p>
      </div>
    );
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleUpload = () => {
    files.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const type = ext === "pdf" ? "pdf" : ext === "docx" ? "docx" : "txt";
      addDocument(projectId!, {
        name: file.name,
        type: type as "pdf" | "docx" | "txt",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    });
    navigate(`${basePath}/project/${projectId}`);
  };

  return (
    <div className="p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(`${basePath}/project/${projectId}`)}
          className={`mb-4 flex items-center gap-1 text-sm text-surface-foreground/50 transition-colors ${isGemini ? "hover:text-accent" : "hover:text-primary"}`}
        >
          <ArrowLeft className="h-4 w-4" /> Back to {project.name}
        </button>

        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${isGemini ? "bg-accent/10" : "bg-primary/10"}`}>
            <Upload className={`h-6 w-6 ${isGemini ? "text-accent" : "text-primary"}`} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-hero-foreground">Upload Documents</h1>
            <p className="text-sm text-surface-foreground/50">
              Add documents to <strong className="text-hero-foreground">{project.name}</strong>
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-surface-foreground/40" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {isGemini
                ? "Upload documents for Gemini to use as additional context in conversations."
                : "Uploaded documents are indexed for RAG search. Ask questions in a chat and receive answers backed by citations from these documents."}
            </TooltipContent>
          </Tooltip>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center transition-colors ${
            dragOver
              ? isGemini ? "border-accent bg-accent/5" : "border-primary bg-primary/5"
              : isGemini ? "border-accent/10 hover:border-accent/30" : "border-white/10 hover:border-primary/30"
          }`}
        >
          <Upload className="h-10 w-10 text-surface-foreground/25" />
          <p className="mt-4 text-sm font-medium text-surface-foreground/60">
            Drag & drop your documents here
          </p>
          <p className="mt-1 text-xs text-surface-foreground/40">
            Accepted formats: PDF, DOCX, TXT
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
            <span className={`mt-4 inline-block cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isGemini ? "bg-accent/10 text-accent hover:bg-accent/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
              Browse Files
            </span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-surface-foreground/70">
                  <FileText className={`h-4 w-4 ${isGemini ? "text-accent/60" : "text-primary/60"}`} />
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-surface-foreground/40">
                    ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
                <button
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded p-1 text-surface-foreground/40 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            variant={isGemini ? "default" : "hero"}
            onClick={handleUpload}
            disabled={files.length === 0}
            className={`gap-2 ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25" : ""}`}
          >
            <Upload className="h-4 w-4" /> Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""}` : "Documents"}
          </Button>
          <Button variant="ghost" onClick={() => navigate(`${basePath}/project/${projectId}`)} className="text-surface-foreground/60">
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadDocuments;
