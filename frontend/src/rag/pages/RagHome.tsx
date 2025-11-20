// frontend/src/rag/pages/RagHome.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  createRagProject,
  getAllRagProjects,
} from "../../helpers/api-communicator";

const RagHome: React.FC = () => {
  const navigate = useNavigate();

  // Create a new project and open it
  const handleCreateProject = async () => {
    const name = prompt("Enter project name:");
    if (!name) return;

    try {
      const res = await createRagProject({ name });
      sessionStorage.setItem("rag_force_reload", "1");
      navigate(`/rag/project/${res.project._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    }
  };

  // Open most recent project
  const handleOpenRecent = async () => {
    try {
      const res = await getAllRagProjects();
      const list = res.projects;

      if (!list || list.length === 0) {
        alert("No projects available.");
        return;
      }

      navigate(`/rag/project/${list[0]._id}`);
    } catch (err) {
      console.error(err);
      alert("Error loading recent project");
    }
  };

  return (
    <div
      style={{
        paddingTop: 80,
        textAlign: "center",
        color: "white",
        maxWidth: 650,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 40, marginBottom: 14, fontWeight: 700 }}>
        RAG Workspace
      </h1>

      <p style={{ fontSize: 17, opacity: 0.8, marginBottom: 50 }}>
        Build research projects, upload scientific documents, and query them
        intelligently with Retrieval-Augmented Generation.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 22,
        }}
      >
        <button
          onClick={handleCreateProject}
          style={{
            padding: "14px 26px",
            background: "#2563eb",
            borderRadius: 12,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            color: "white",
            boxShadow: "0 0 12px rgba(37,99,235,0.4)",
          }}
        >
          + Create Project
        </button>

        <button
          onClick={handleOpenRecent}
          style={{
            padding: "14px 26px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            color: "white",
          }}
        >
          Open Most Recent
        </button>
      </div>

      <div style={{ marginTop: 70, opacity: 0.6, fontSize: 14 }}>
        Tip: You can also create or switch projects anytime from the sidebar.
      </div>
    </div>
  );
};

export default RagHome;
