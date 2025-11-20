import React, { useState } from "react";
import { uploadRagDocument } from "../../helpers/api-communicator";

const RagUpload: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [file, setFile] = useState<File | null>(null);

  const upload = async () => {
    if (!file) return alert("No file selected");
    await uploadRagDocument(projectId, file);
    alert("Upload successful");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload PDF to Project</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={upload}
        style={{
          marginTop: 12,
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
        }}
      >
        Upload
      </button>
    </div>
  );
};

export default RagUpload;
