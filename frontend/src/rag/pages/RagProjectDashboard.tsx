// frontend/src/rag/pages/RagProjectDashboard.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAllRagProjects,
  getRagDocuments,
  deleteRagDocument,
  getProjectRagChats,
  createRagChatAPI,
} from "../../helpers/api-communicator";

const RagProjectDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getAllRagProjects();
      const project = res.projects?.find((p: any) => p._id === projectId);
      if (project) setProjectName(project.name);
    })();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      setLoadingDocs(true);
      try {
        const res = await getRagDocuments(projectId);
        setDocuments(res.documents || []);
      } finally {
        setLoadingDocs(false);
      }
    })();
  }, [projectId]);

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document from the project?")) return;
    await deleteRagDocument(docId);
    const refreshed = await getRagDocuments(projectId!);
    setDocuments(refreshed.documents || []);
  };

  // Open chat: if chat exists open it, else create one then open
  const openChatForProject = async () => {
    if (!projectId) return;
    // optional guard: require at least one document before chat
    const docs = (await getRagDocuments(projectId)).documents || [];
    if (!docs.length) {
      alert("Please upload at least one document before opening the project chat.");
      navigate(`/rag/project/${projectId}/upload`);
      return;
    }

    const res = await getProjectRagChats(projectId);
    const chats = res.chats || [];
    if (chats.length > 0) {
      navigate(`/rag/project/${projectId}/chat/${chats[0]._id}`);
    } else {
      const created = await createRagChatAPI(projectId!, "New chat");
      if (created && created.chat && created.chat._id) {
        navigate(`/rag/project/${projectId}/chat/${created.chat._id}`);
      } else {
        // fallback - go to chat base
        navigate(`/rag/project/${projectId}/chat`);
      }
    }
  };

  return (
    <div style={{ padding: 32, color: "white" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Project: {projectName || "—"}</h1>
      <p style={{ opacity: 0.75, marginBottom: 20 }}>
        Manage documents and run scientific RAG queries for this project.
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <button
          onClick={() => navigate(`/rag/project/${projectId}/upload`)}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            background: "#6b8cff",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Upload Documents
        </button>

        <button
          onClick={openChatForProject}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Open RAG Scientific Chat
        </button>
      </div>

      <div style={{ marginTop: 8, marginBottom: 20 }}>
        <div style={{ color: "rgba(255,255,255,0.8)", marginBottom: 8, fontWeight: 600 }}>How to view uploaded documents</div>
        <div style={{ color: "rgba(255,255,255,0.7)" }}>
          Click the project on the left sidebar to see the document list and metadata. Use the Upload button above to add more documents.
        </div>
      </div>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Documents</h2>

        {loadingDocs ? (
          <div style={{ opacity: 0.7 }}>Loading documents…</div>
        ) : documents.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No documents uploaded yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {documents.map((doc) => (
              <li
                key={doc._id ?? doc.docId}
                style={{
                  padding: "12px 16px",
                  marginBottom: 12,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 16 }}>{doc.filename}</div>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>
                    {doc.chunkCount ?? doc.chunks?.length ?? "—"} chunks • Uploaded{" "}
                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "—"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => handleDelete(doc.docId ?? doc._id)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default RagProjectDashboard;
