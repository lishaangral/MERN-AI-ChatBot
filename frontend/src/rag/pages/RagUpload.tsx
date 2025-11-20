import React, { useState, DragEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadRagDocument } from "../../helpers/api-communicator";

const RagUpload: React.FC = () => {
  const nav = useNavigate();
  const { projectId } = useParams();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    setFiles((prev) => [...prev, ...Array.from(selected)]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files;
    if (!dropped) return;

    setFiles((prev) => [...prev, ...Array.from(dropped)]);
  };

  const uploadAll = async () => {
    if (files.length === 0) {
      setMessage("No files selected.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      for (const f of files) {
        await uploadRagDocument(projectId!, f);
      }
      setFiles([]);
      setMessage("All files uploaded successfully!");
      nav(`/rag/project/${projectId}/chat`);
    } catch (err) {
      console.error(err);
      setMessage("Error uploading files.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2 style={{ marginBottom: 16 }}>Upload Documents</h2>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          padding: 40,
          border: "2px dashed rgba(255,255,255,0.4)",
          borderRadius: 12,
          textAlign: "center",
          marginBottom: 20,
          background: "rgba(255,255,255,0.05)",
        }}
      >
        Drag & Drop files here  
        <br />
        <span style={{ opacity: 0.7, fontSize: 13 }}>or click below</span>
      </div>

      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        multiple
        onChange={handleFileSelect}
        style={{ marginBottom: 20 }}
      />

      {files.length > 0 && (
        <div
          style={{
            marginBottom: 20,
            padding: 10,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
          }}
        >
          <h4>Ready to upload:</h4>
          <ul>
            {files.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={uploadAll}
        disabled={uploading}
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          background: uploading
            ? "rgba(255,255,255,0.2)"
            : "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.2)",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? "Uploading..." : "Upload All"}
      </button>

      {message && (
        <p style={{ marginTop: 16, opacity: 0.9 }}>{message}</p>
      )}
    </div>
  );
};

export default RagUpload;
