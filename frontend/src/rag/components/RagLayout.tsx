import React, { useEffect, useState } from "react";
import RagSidebar from "./RagSidebar";
import {
  getAllRagProjects,
  createRagProject,
  deleteRagProject,
} from "../../helpers/api-communicator";
import { useNavigate } from "react-router-dom";

const RagLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadProjects = async () => {
    const res = await getAllRagProjects();
    setProjects(res.projects || []);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async () => {
    const name = prompt("Enter project name:");
    if (!name) return;

    const res = await createRagProject({ name });
    await loadProjects();
    setActiveProjectId(res.project._id);
    navigate(`/rag/project/${res.project._id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteRagProject(id);
    await loadProjects();
    setActiveProjectId(null);
    navigate("/rag");
  };

  const handleSelect = (id: string) => {
    setActiveProjectId(id);
    navigate(`/rag/project/${id}`);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <RagSidebar
        projects={projects}
        activeProject={activeProjectId}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onSelect={handleSelect}
      />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export default RagLayout;
