import React, { useEffect, useState } from "react";
import RagSidebar from "../components/RagSidebar";
import {
  createRagProject,
  getAllRagProjects,
  deleteRagProject,
} from "../../helpers/api-communicator";
import { useNavigate } from "react-router-dom";

const RagHome: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
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
    setActiveProject(res.project._id);
  };

  const handleSelect = (id: string) => {
    setActiveProject(id);
    navigate(`/rag/project/${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteRagProject(id);
    await loadProjects();
    setActiveProject(null);
  };

  return (
    <div style={{ display: "flex" }}>
      <RagSidebar
        projects={projects}
        activeProject={activeProject}
        onCreate={handleCreate}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />

      <main style={{ padding: 24 }}>
        <h1>RAG Workspace</h1>
        <p>Select a project or create a new one from the left.</p>
      </main>
    </div>
  );
};

export default RagHome;
