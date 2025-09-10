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
        built on the MERN stack with authentication, persistent chat history, and
        a beautiful responsive UI.
      </p>

      {/* CTA buttons */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
        {auth?.isLoggedIn ? (
          <Link
            to="/chat"
            style={{
              background: "#00ffcc",
              color: "#000",
              padding: "0.75rem 1.5rem",
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            Go to Chats
          </Link>
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
                transition: "background 0.2s",
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
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#00ffcc" }}>⚡ Fast Responses</h3>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
            Powered by Gemini API for quick and intelligent conversations.
          </p>
        </div>
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#00ffcc" }}>🔒 Secure</h3>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
            Authentication and chat history stored securely with MongoDB.
          </p>
        </div>
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#00ffcc" }}>💬 Persistent Chats</h3>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
            Access your previous conversations anytime with an intuitive sidebar.
          </p>
        </div>
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#00ffcc" }}>🎨 Clean UI</h3>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
            Minimal, responsive, and user-friendly design for a smooth experience.
          </p>
        </div>
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#00ffcc" }}>🛠️ Customizable Prompts</h3>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
            Tailor conversations to your needs, from coding help to creative writing.
          </p>
        </div>
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#00ffcc" }}>🌐 Cross-Platform</h3>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
            Access your chatbot from any device with full responsive support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
