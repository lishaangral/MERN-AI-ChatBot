import { motion } from "framer-motion";
import { FolderPlus, Upload, FileText, X, Check, HelpCircle, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";
import { createRagProject, uploadRagDocument } from "@/helpers/api-communicator";

const NewProject = () => {

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

  const [filesState, setFilesState] = useState<UploadFile[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isGemini = location.pathname.startsWith("/gemini");
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  // const { addProject, addGeminiProject, addDocument } = useWorkspace();
  const basePath = isGemini ? "/gemini" : "/rag";

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

  // const updateFile = (index: number, updates: Partial<UploadFile>) => {
  //   setFilesState(prev => {
  //     const copy = [...prev];
  //     copy[index] = { ...copy[index], ...updates };
  //     return copy;
  //   });
  // };

  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   setDragOver(false);
  //   const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
  //     ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)
  //   );
  //   setFilesState((prev) => [...prev, ...droppedFiles]);
  // };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFilesState((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Project name required");
      return;
    }

    setLoading(true);

    try {
      const res = await createRagProject({ name, description });

      const projectId = res?.projectId as string;

      if (!projectId) {
        throw new Error("Project ID not returned");
      }

      setProjectId(projectId);
      console.log("PROJECT CREATED:", projectId);

      const allSuccess = await uploadAllFiles(projectId);

      if (!allSuccess) {
        toast.error("Some files failed to upload. Please retry them.");
        setLoading(false);
        return;
      } else {
        toast.success("Project created successfully");
        navigate(`/rag/project/${projectId}`);
      }      
    } catch (err) {
      console.error("CREATE PROJECT ERROR:", err);
      toast.error("Project creation failed");
    } finally {
      setLoading(false);
    }
  };

  // const retryFile = (projectId: string, index: number) => {
  //   uploadSingle(projectId, index);
  // };

  // const retryUpload = async (fileId: string, projectId: string) => {
  //   const file = filesState.find((f) => f.id === fileId);
  //   if (!file) return;

  //   await uploadSingle(file, projectId);
  // };

  const retryUpload = async (fileId: string) => {
    if (!projectId) {
      toast.error("Project not initialized");
      return;
    }

    const file = filesState.find((f) => f.id === fileId);
    if (!file) return;

    await uploadSingle(file, projectId);
  };

  // const uploadSingle = async (projectId: string, index: number) => {
  //   try {
  //     const fileObj = filesState[index];
  //     if (!fileObj) return;

  //     updateFile(index, { status: "uploading", progress: 0 });

  //     try {
  //       await uploadRagDocument(projectId, fileObj.file, (progress: number) => {
  //         updateFile(index, { progress });
  //       });

  //       updateFile(index, { status: "success", progress: 100 });

  //     } catch (err) {
  //       console.error("UPLOAD FAILED:", err);

  //       updateFile(index, {
  //         status: "failed",
  //         error: "Upload failed",
  //       });
  //     }
  //   }
  // };

  const uploadSingle = async (f: UploadFile, pid: string) => {
    try {
      setFilesState((prev) =>
        prev.map((p) =>
          p.id === f.id ? { ...p, status: "uploading", progress: 0 } : p
        )
      );

      await uploadRagDocument(pid, f.file, (progress) => {
        setFilesState((prev) =>
          prev.map((p) =>
            p.id === f.id ? { ...p, progress } : p
          )
        );
      });

      setFilesState((prev) =>
        prev.map((p) =>
          p.id === f.id ? { ...p, status: "success", progress: 100 } : p
        )
      );
      return true;

    } catch (err) {
      console.error("UPLOAD FAILED:", err);

      setFilesState((prev) =>
        prev.map((p) =>
          p.id === f.id ? { ...p, status: "failed" } : p
        )
      );

      // IMPORTANT: show toast for backend overload / failure
      toast.error(
        err?.response?.data?.error ||
        "Upload failed. Server may be overloaded."
      );

      return false;
    }
  };

  // const uploadAllFiles = async (projectId: string) => {
  //   let index = 0;

  //   const workers = Array(3).fill(null).map(async () => {
  //     while (index < filesState.length) {
  //       const current = index++;
  //       await uploadSingle(projectId, current);
  //     }
  //   });

  //   await Promise.all(workers);
  // };

  const uploadAllFiles = async (pid: string) => {
    let allSuccess = true;

    for (const f of filesState) {
      if (f.status === "pending" || f.status === "failed") {
        const success = await uploadSingle(f, pid);
        if (!success) allSuccess = false;
      }
    }
    return allSuccess;
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
                  // onChange={(e) => {
                  //   if (e.target.files) setFilesState((prev) => [...prev, ...Array.from(e.target.files!)]);
                  // }}
                  onChange={(e) => handleFiles(e.target.files)}
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
          {filesState.length > 0 && (
            <div className="space-y-2">
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
        </div>
      </motion.div>
    </div>
  );
};

export default NewProject;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useToast } from "@/hooks/use-toast";
// import { createRagProject, uploadRagDocument } from "@/helpers/api-communicator";

// type UploadFile = {
//   file: File;
//   status: "pending" | "uploading" | "success" | "failed";
//   progress: number;
//   error?: string;
//   retries?: number;
// };

// const MAX_FILES = 10;
// const MAX_SIZE_MB = 10;
// const ALLOWED_TYPES = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
// const CONCURRENT_UPLOADS = 3;

// const NewProject = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [files, setFiles] = useState<UploadFile[]>([]);
//   const [loading, setLoading] = useState(false);

//   // ---------------- FILE ADD ----------------
//   const handleFiles = (selected: FileList | null) => {
//     if (!selected) return;

//     const newFiles: UploadFile[] = [];

//     for (const file of Array.from(selected)) {
//       if (files.length + newFiles.length >= MAX_FILES) {
//         toast({ title: "Max 10 files allowed" });
//         break;
//       }

//       if (!ALLOWED_TYPES.includes(file.type)) {
//         toast({ title: `${file.name} not supported` });
//         continue;
//       }

//       if (file.size > MAX_SIZE_MB * 1024 * 1024) {
//         toast({ title: `${file.name} exceeds 10MB` });
//         continue;
//       }

//       newFiles.push({
//         file,
//         status: "pending",
//         progress: 0,
//         retries: 0,
//       });
//     }

//     setFiles(prev => [...prev, ...newFiles]);
//   };

//   // ---------------- REMOVE FILE ----------------
//   const removeFile = (index: number) => {
//     setFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   // ---------------- UPDATE FILE ----------------
//   const updateFile = (index: number, updates: Partial<UploadFile>) => {
//     setFiles(prev => {
//       const copy = [...prev];
//       copy[index] = { ...copy[index], ...updates };
//       return copy;
//     });
//   };

//   // ---------------- UPLOAD SINGLE FILE ----------------
//   const uploadSingle = async (projectId: string, index: number) => {
//     const fileObj = files[index];
//     if (!fileObj) return;

//     updateFile(index, { status: "uploading", progress: 0 });

//     try {
//       await uploadRagDocument(projectId, fileObj.file, (progress: number) => {
//         updateFile(index, { progress });
//       });

//       updateFile(index, { status: "success", progress: 100 });

//     } catch (err) {
//       console.error("UPLOAD FAILED", err);

//       if ((fileObj.retries || 0) < 1) {
//         updateFile(index, { retries: (fileObj.retries || 0) + 1 });
//         return uploadSingle(projectId, index); // auto retry
//       }

//       updateFile(index, { status: "failed", error: "Upload failed" });
//     }
//   };

//   // ---------------- CONCURRENCY QUEUE ----------------
//   const uploadAllFiles = async (projectId: string) => {
//     let index = 0;

//     const workers = Array(CONCURRENT_UPLOADS).fill(null).map(async () => {
//       while (index < files.length) {
//         const currentIndex = index++;
//         await uploadSingle(projectId, currentIndex);
//       }
//     });

//     await Promise.all(workers);
//   };

//   // ---------------- CREATE PROJECT ----------------
//   const handleCreate = async () => {
//     if (!name.trim()) {
//       toast({ title: "Project name required" });
//       return;
//     }

//     setLoading(true);

//     try {
//       // STEP 1: CREATE PROJECT
//       const res = await createRagProject({ name, description });
//       const projectId = res.projectId;

//       console.log("PROJECT CREATED:", projectId);

//       // STEP 2: UPLOAD FILES
//       if (files.length > 0) {
//         await uploadAllFiles(projectId);
//       }

//       const failed = files.some(f => f.status === "failed");

//       if (failed) {
//         toast({ title: "Some files failed. Retry them." });
//         setLoading(false);
//         return;
//       }

//       toast({ title: "Project created successfully" });

//       // STEP 3: NAVIGATE
//       navigate(`/rag/project/${projectId}`);

//     } catch (err) {
//       console.error(err);
//       toast({ title: "Project creation failed" });
//     }

//     setLoading(false);
//   };

//   // ---------------- RETRY ----------------
//   const retryFile = (index: number) => {
//     if (!files[index]) return;
//     uploadSingle("", index); // projectId will already exist in real case
//   };

//   // ---------------- UI ----------------
//   return (
//     <div className="p-6">

//       <h1>Create New Project</h1>

//       <input
//         placeholder="Project Name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//       />

//       <textarea
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//       />

//       <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />

//       <div>
//         {files.map((f, i) => (
//           <div key={i} className="border p-2 mb-2">

//             <div className="flex justify-between items-center">

//               {/* LEFT: status icon */}
//               <div>
//                 {f.status === "success" && "✅"}
//                 {f.status === "failed" && (
//                   <button onClick={() => retryFile(i)}>🔁</button>
//                 )}
//               </div>

//               {/* FILE NAME */}
//               <div>{f.file.name}</div>

//               {/* REMOVE */}
//               <button onClick={() => removeFile(i)}>❌</button>
//             </div>

//             {/* PROGRESS BAR */}
//             {f.status === "uploading" && (
//               <div className="h-1 bg-gray-200 mt-1">
//                 <div
//                   className="h-1 bg-green-500"
//                   style={{ width: `${f.progress}%` }}
//                 />
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       <button onClick={handleCreate} disabled={loading}>
//         {loading ? "Creating..." : "Create Project"}
//       </button>

//     </div>
//   );
// };

// export default NewProject;