// frontend/src/components/shared/ConfirmModal.tsx
import React from "react";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<Props> = ({ open, title = "Confirm", description = "Are you sure?", onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <>
      {/* overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onCancel}
      />

      {/* modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: "fixed",
          zIndex: 70,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 360,
          maxWidth: "90%",
          background: "#0b1116",
          color: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
        <p style={{ margin: 0, marginBottom: 16, color: "rgba(255,255,255,0.75)" }}>{description}</p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "#2563eb", // blue confirm
              border: "none",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
