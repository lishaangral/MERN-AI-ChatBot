import React from "react";
import { Plus, Trash2, Folder } from "lucide-react";

type RagProject = {
  _id: string;
  name: string;
};

type Props = {
  projects: RagProject[];
  activeProject?: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
};

const RagSidebar: React.FC<Props> = ({
  projects,
  activeProject,
  onSelect,
  onCreate,
  onDelete,
}) => {
  return (
    <aside
      style={{
        width: 260,
        background: "#0b1116",
        color: "white",
        height: "100vh",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={onCreate}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      <h3 style={{ marginBottom: 12 }}>Projects</h3>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {projects.map((p) => (
          <div
            key={p._id}
            onClick={() => onSelect(p._id)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              marginBottom: 8,
              cursor: "pointer",
              background:
                activeProject === p._id
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Folder size={16} />
              {p.name}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(p._id);
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "white",
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default RagSidebar;
