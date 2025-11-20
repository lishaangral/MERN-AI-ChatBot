import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllRagProjects } from "../../helpers/api-communicator";

const RagProjectDashboard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    (async () => {
      const res = await getAllRagProjects();
      const proj = res.projects.find((p: any) => p._id === projectId);
      if (proj) setProjectName(proj.name);
    })();
  }, [projectId]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Project: {projectName}</h1>

      <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
        <button
          onClick={() => navigate(`/rag/project/${projectId}/upload`)}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
        >
          Upload PDF
        </button>

        <button
          onClick={() => navigate(`/rag/project/${projectId}/chat`)}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
        >
          Open RAG Chat
        </button>
      </div>
    </div>
  );
};

export default RagProjectDashboard;
