// frontend/src/pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Home: React.FC = () => {
  const auth = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#fff",
        textAlign: "center",
      }}
    >
      {/* Hero section */}
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: 700,
          marginBottom: "1rem",
          background: "linear-gradient(90deg, #00ffcc, #2563eb)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        MERN AI ChatBot
      </h1>

      <p
        style={{
          maxWidth: "650px",
          fontSize: "1.25rem",
          marginBottom: "2rem",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        A modern conversational AI assistant powered by{" "}
        <span style={{ fontWeight: 600, color: "#00ffcc" }}>Gemini API</span>,
        featuring real-time chat, persistent history, document-backed RAG
        intelligence, and a clean responsive interface.
      </p>

      {/* CTA buttons */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
        {auth?.isLoggedIn ? (
          <>
            <Link
              to="/chat"
              style={{
                background: "#00ffcc",
                color: "#000",
                padding: "0.75rem 1.5rem",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to Chats
            </Link>

            <Link
              to="/rag"
              style={{
                background: "#2563eb",
                color: "#fff",
                padding: "0.75rem 1.5rem",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              RAG Workspace
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                background: "#00ffcc",
                color: "#000",
                padding: "0.75rem 1.5rem",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Login
            </Link>

            <Link
              to="/signup"
              style={{
                background: "#2563eb",
                color: "#fff",
                padding: "0.75rem 1.5rem",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Signup
            </Link>
          </>
        )}
      </div>

      {/* Features */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
          maxWidth: "900px",
          width: "100%",
          marginTop: "3rem",
        }}
      >
        <FeatureCard
          title="⚡ Fast Responses"
          desc="Powered by Gemini API for quick and intelligent conversations."
        />
        <FeatureCard
          title="🔒 Secure"
          desc="Authentication and chat history stored securely with MongoDB."
        />
        <FeatureCard
          title="💬 Persistent Chats"
          desc="Access previous conversations anytime with an intuitive sidebar."
        />
        <FeatureCard
          title="🎨 Clean UI"
          desc="Minimal, responsive, and user-friendly design for a smooth experience."
        />
        <FeatureCard
          title="🛠️ Custom Prompts"
          desc="Tailor conversations for coding, research, writing, and more."
        />
        <FeatureCard
          title="🌐 Cross-Platform"
          desc="Use your chatbot seamlessly from any device."
        />

        {/* NEW RAG FEATURES */}
        <FeatureCard
          title="📚 Intelligent RAG Workspace"
          desc="Upload scientific papers, plant pathology notes, or reports and ask document-aware research questions."
          highlight
        />

        <FeatureCard
          title="🔍 Retrieval-Augmented Answers"
          desc="The system finds relevant text in your uploaded files, processes it using embeddings, and generates grounded responses."
          highlight
        />
      </div>
    </div>
  );
};

const FeatureCard = ({
  title,
  desc,
  highlight = false,
}: {
  title: string;
  desc: string;
  highlight?: boolean;
}) => (
  <div
    style={{
      padding: "1.5rem",
      borderRadius: 12,
      background: highlight
        ? "rgba(0,255,204,0.08)"
        : "rgba(255,255,255,0.05)",
      textAlign: "left",
      border: highlight ? "1px solid #00ffcc33" : "none",
    }}
  >
    <h3 style={{ marginBottom: "0.5rem", color: "#00ffcc" }}>{title}</h3>
    <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>{desc}</p>
  </div>
);

export default Home;
