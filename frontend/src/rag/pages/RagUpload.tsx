import React, { useState, DragEvent } from "react";
import { uploadRagDocument } from "../../helpers/api-communicator";

const RagUpload: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;
    setFiles([...files, ...Array.from(e.dataTransfer.files)]);
  };

  const uploadAll = async () => {
    if (files.length === 0) {
      setMessage("No files selected.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      for (const file of files) {
        await uploadRagDocument(projectId, file);
      }
      setMessage("All files uploaded successfully!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      setMessage("Error uploading files.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2 style={{ marginBottom: 16 }}>Upload PDF Documents</h2>

      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          padding: "40px",
          border: "2px dashed rgba(255,255,255,0.4)",
          borderRadius: 12,
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 20,
          background: "rgba(255,255,255,0.05)",
        }}
      >
        Drag & Drop PDFs Here  
        <br />
        <span style={{ opacity: 0.7, fontSize: 13 }}>
          or click below to select
        </span>
      </div>

      {/* File Input */}
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileSelect}
        style={{
          marginTop: 10,
          marginBottom: 20,
        }}
      />

      {/* Selected Files List */}
      {files.length > 0 && (
        <div
          style={{
            marginBottom: 20,
            padding: 10,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
          }}
        >
          <h4>Files ready to upload:</h4>
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
            : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? "Uploading..." : "Upload All Files"}
      </button>

      {message && (
        <p style={{ marginTop: 16, opacity: 0.9 }}>{message}</p>
      )}
    </div>
  );
};

export default RagUpload;
