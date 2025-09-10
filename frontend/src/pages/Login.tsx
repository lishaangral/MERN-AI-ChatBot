// frontend/src/pages/Login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomizedInput from "../components/shared/CustomizedInput";
import { useAuth } from "../context/useAuth";
import { toast } from "react-hot-toast";

const Login: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";

    if (!email.trim() || !password.trim()) {
      toast.error("Please provide email and password");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Signing in...", { id: "login" });
      await auth?.login(email, password);
      toast.success("Signed in successfully", { id: "login" });
      navigate("/chat");
    } catch (err) {
      console.error(err);
      toast.error("Signing in failed", { id: "login" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(180deg, rgba(7,12,18,0.6), rgba(11,17,26,1))",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          borderRadius: 12,
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
          border: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 12, color: "#e6eef6" }}>Login</h2>
        <p style={{ marginTop: 0, marginBottom: 20, color: "rgba(255,255,255,0.7)" }}>
          Sign in to access your chats and start a conversation with the Gemini-powered assistant.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Using your existing CustomizedInput component */}
          <CustomizedInput type="email" name="email" label="Email" />
          <CustomizedInput type="password" name="password" label="Password" />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 6,
              padding: "12px 14px",
              borderRadius: 10,
              background: isSubmitting ? "rgba(37,99,235,0.7)" : "#2563eb",
              color: "#fff",
              border: "none",
              cursor: isSubmitting ? "default" : "pointer",
              fontWeight: 600,
              fontSize: 16,
              transition: "transform 120ms ease",
            }}
          >
            {isSubmitting ? "Signing in..." : "Submit"}
          </button>
        </form>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(255,255,255,0.65)" }}>
          <small>Don't have an account?</small>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <button
              type="button"
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Create account
            </button>
          </Link>
        </div>

        <div style={{ marginTop: 12, color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
          <p style={{ margin: 0 }}>
            By signing in you agree to the project usage policy. Gemini responses may be imperfect — always verify critical content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
