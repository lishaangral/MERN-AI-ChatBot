import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAllRagProjects,
  getRagDocuments,
  deleteRagDocument,
} from "../../helpers/api-communicator";

const RagProjectDashboard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // load project name
  useEffect(() => {
    (async () => {
      const res = await getAllRagProjects();
      const project = res.projects.find((p: any) => p._id === projectId);
      if (project) setProjectName(project.name);
    })();
  }, [projectId]);

  // load documents list
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      setLoadingDocs(true);
      try {
        const res = await getRagDocuments(projectId);
        setDocuments(res.documents || []);
      } catch (err) {
        setDocuments([]);
      } finally {
        setLoadingDocs(false);
      }
    })();
  }, [projectId]);

  const onUploadClick = () => navigate(`/rag/project/${projectId}/upload`);
  const onOpenChatClick = () => {
    // navigate to the project's chat landing; chat creation/selection logic is handled by RagChat
    navigate(`/rag/project/${projectId}/chat`);
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document? This will remove its chunks from the index.")) return;
    await deleteRagDocument(docId);
    // refresh
    const refreshed = await getRagDocuments(projectId!);
    setDocuments(refreshed.documents || []);
  };

  return (
    <div style={{ padding: 32, color: "white", maxWidth: 1100, margin: "0 auto" }}>
      {/* header + actions - centered block */}
      <div style={{ textAlign: "left", marginBottom: 28 }}>
        <h1 style={{ fontSize: 36, margin: 0 }}>{projectName ? `Project: ${projectName}` : "Project"}</h1>
        <p style={{ color: "rgba(255,255,255,0.75)", marginTop: 10, maxWidth: 820 }}>
          Manage documents and run scientific RAG queries for this project. Upload PDFs, DOCX or TXT files and ask
          context-aware questions — results will be backed by the documents you provide.
        </p>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <button
            onClick={onUploadClick}
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              background: "#506bff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 6px 20px rgba(80,107,255,0.18)",
            }}
          >
            Upload Documents
          </button>

          <button
            onClick={onOpenChatClick}
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Open RAG Scientific Chat
          </button>
        </div>
      </div>

      {/* little helper */}
      <div style={{ margin: "18px 0 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <strong style={{ color: "rgba(255,255,255,0.95)" }}>How to view uploaded documents</strong>
        <span style={{ color: "rgba(255,255,255,0.6)" }}>
          Click the project on the left sidebar to reveal uploaded documents and chat tabs. Use Upload to add more files.
        </span>
      </div>

      {/* documents cards */}
      <div>
        <h3 style={{ marginBottom: 12 }}>Documents</h3>

        {loadingDocs ? (
          <div style={{ color: "rgba(255,255,255,0.6)" }}>Loading documents…</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: 28, borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No documents uploaded yet</div>
            <div style={{ color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
              Upload files to make your project queryable.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            {documents.map((d) => (
              <div
                key={d.docId ?? d._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{d.filename || d.source || "Document"}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", marginTop: 6, fontSize: 13 }}>
                    {d.chunkCount ?? d.chunks ?? 0} chunks • Uploaded {new Date(d.uploadedAt || d.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => navigate(`/rag/project/${projectId}/document/${d.docId || d._id}/view`)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "transparent",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>

                  <button
                    onClick={() => handleDelete(d.docId || d._id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "transparent",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RagProjectDashboard;
