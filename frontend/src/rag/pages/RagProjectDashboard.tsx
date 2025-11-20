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

  // Load project name
  useEffect(() => {
    (async () => {
      const res = await getAllRagProjects();
      const project = res.projects.find((p: any) => p._id === projectId);
      if (project) setProjectName(project.name);
    })();
  }, [projectId]);

  // Load documents list
  useEffect(() => {
    if (!projectId) return;

    (async () => {
      const res = await getRagDocuments(projectId);
      setDocuments(res.documents || []);
    })();
  }, [projectId]);

  const handleDelete = async (docId: string) => {
    await deleteRagDocument(docId);
    const refreshed = await getRagDocuments(projectId!);
    setDocuments(refreshed.documents);
  };

  return (
    <div style={{ padding: "32px", color: "white" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>
        Project: {projectName}
      </h1>

      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Manage documents and run scientific RAG queries for this project.
      </p>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
        }}
      >
        <button
          onClick={() => navigate(`/rag/project/${projectId}/upload`)}
          style={{
            padding: "14px 18px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Upload PDF Document
        </button>

        <button
          onClick={() => navigate(`/rag/project/${projectId}/chat`)}
          style={{
            padding: "14px 18px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Open RAG Scientific Chat
        </button>
      </div>

      {/* DOCUMENT LIST */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Documents</h2>

        {documents.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No documents uploaded yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {documents.map((doc) => (
              <li
                key={doc._id}
                style={{
                  padding: "12px 16px",
                  marginBottom: 12,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 16 }}>{doc.filename}</div>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>
                    {doc.chunkCount} chunks • Uploaded{" "}
                    {new Date(doc.uploadedAt).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.docId)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RagProjectDashboard;
