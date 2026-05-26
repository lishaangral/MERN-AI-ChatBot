import { motion } from "framer-motion";
import { Upload, FileText, X, ArrowLeft, HelpCircle, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  uploadRagDocument,
  getRagProjectById,
  uploadGeminiFile,
  getGeminiProjectById,
} from "@/helpers/api-communicator";

import { toast } from "react-hot-toast";
import axios from "axios";

const UploadDocuments = () => {

  type UploadFile = {
    file: File;
    id: string; // unique identifier for retrying failed uploads
    name: string;
    size: number;
    status: "pending" | "uploading" | "success" | "failed";
    progress: number;
    retries?: number;
    error?: string;
  };

  type Project = {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };

  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isGemini = location.pathname.startsWith("/gemini");
  // const { getProjectForWorkspace, addDocument } = useWorkspace();
  // const [files, setFiles] = useState<File[]>([]);
  const [filesState, setFilesState] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  // const project = getProjectForWorkspace(projectId!, isGemini);
  const basePath = isGemini ? "/gemini" : "/rag";
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadProject = async () => {

      if (!projectId) return;

      try {

        setLoading(true);

        const res = isGemini
          ? await getGeminiProjectById(projectId)
          : await getRagProjectById(projectId);

        setProject(res.project);

      } catch (err) {

        console.error(err);

        setProject(null);

      } finally {

        setLoading(false);
      }
    };

    loadProject();

  }, [projectId, isGemini]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-surface-foreground/50">
          Loading project...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-surface-foreground/50">Project not found.</p>
      </div>
    );
  }

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;

    const mappedFiles: UploadFile[] = Array.from(selected).map((file) => ({
      file,
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      status: "pending",
      progress: 0,
      retries: 0,
    }));

    setFilesState((prev) => [...prev, ...mappedFiles]);
  };

  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   setDragOver(false);
  //   const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
  //     ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)
  //   );
  //   setFiles((prev) => [...prev, ...droppedFiles]);
  // };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    handleFiles(e.dataTransfer.files);
  };

  const uploadSingle = async (
    f: UploadFile
  ) => {

    try {

      setFilesState((prev) =>
        prev.map((p) =>
          p.id === f.id
            ? {
                ...p,
                status: "uploading",
                progress: 0,
              }
            : p
        )
      );

      if (isGemini) {
        await uploadGeminiFile(
          projectId!,
          f.file
        );
      } else {
        await uploadRagDocument(
          projectId!,
          f.file,
          (progress) => {
            setFilesState((prev) =>
              prev.map((p) =>
                p.id === f.id
                  ? {
                      ...p,
                      progress,
                    }
                  : p
              )
            );
          }
        );
      }

      setFilesState((prev) =>
        prev.map((p) =>
          p.id === f.id
            ? {
                ...p,
                status: "success",
                progress: 100,
              }
            : p
        )
      );

      return true;

    } catch (err) {

      console.error(err);

      setFilesState((prev) =>
        prev.map((p) =>
          p.id === f.id
            ? {
                ...p,
                status: "failed",
              }
            : p
        )
      );

      toast.error(
        err?.response?.data?.error ||
        `Failed to upload ${f.name}`
      );

      return false;
    }
  };

  const handleUpload = async () => {

    if (!projectId) {
      toast.error("Project not found");
      return;
    }

    let allSuccess = true;

    for (const f of filesState) {

      if (
        f.status === "pending" ||
        f.status === "failed"
      ) {

        const success =
          await uploadSingle(f);

        if (!success) allSuccess = false;
      }
    }

    if (!allSuccess) {

      toast.error(
        "Some files failed to upload."
      );

      return;
    }

    toast.success(
      "Documents uploaded successfully"
    );

    navigate(
      `${basePath}/project/${projectId}`
    );
  };

  const removeFile = (
    index: number
  ) => {

    setFilesState((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const retryUpload = async (
    fileId: string
  ) => {

    const file =
      filesState.find(
        (f) => f.id === fileId
      );

    if (!file) return;

    await uploadSingle(file);
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
                handleFiles(e.target.files);
              }}
            />
            <span className={`mt-4 inline-block cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isGemini ? "bg-accent/10 text-accent hover:bg-accent/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
              Browse Files
            </span>
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant={isGemini ? "default" : "hero"}
            onClick={handleUpload}
            disabled={filesState.length === 0}
            className={`gap-2 ${isGemini ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25" : ""}`}
          >
            <Upload className="h-4 w-4" /> Upload {filesState.length > 0 ? `${filesState.length} file${filesState.length > 1 ? "s" : ""}` : "Documents"}
          </Button>
          <Button variant="ghost" onClick={() => navigate(`${basePath}/project/${projectId}`)} className="text-surface-foreground/60">
            Cancel
          </Button>
        </div>
        
        {/* File list */}
          {filesState.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-surface-foreground/50">{filesState.length} file{filesState.length !== 1 ? "s" : ""} selected</p>
              {filesState.map((file, i) => (
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

                  <div className="flex items-center gap-2"> 
                    {file.status === "success" && <Check className="h-4 w-4" />}
                    {file.status === "failed" && (
                      <button
                      className="rounded-lg p-1 text-surface-foreground/40 transition-colors hover:text-destructive shrink-0"
                      onClick={() => retryUpload(file.id)}>
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      className="rounded-lg p-1 text-surface-foreground/40 transition-colors hover:text-destructive shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {file.status === "uploading" && (
                      <div className="w-full h-1 bg-gray-300">
                        <div
                          className="h-1 bg-primary"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>                  
                </div>
              ))}
            </div>
          )}
      </motion.div>
    </div>
  );
};

export default UploadDocuments;
