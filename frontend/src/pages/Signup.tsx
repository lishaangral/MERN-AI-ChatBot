// frontend/src/pages/Signup.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomizedInput from "../components/shared/CustomizedInput";
import { signupUser } from "../helpers/api-communicator";
import { toast } from "react-hot-toast";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";
    const confirm = (formData.get("confirmPassword") as string) || "";

    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Creating account...", { id: "signup" });

      // call helper which posts to backend /user/signup
      const data = await signupUser(name.trim(), email.trim(), password);

      toast.success("Account created successfully", { id: "signup" });

      // redirect to login so user can sign in
      navigate("/login");
    } catch (err: any) {
      console.error("Signup error", err);
      // If backend returns structured message it might be in err.response.data; but we show generic for now
      toast.error(err?.message || "Signup failed", { id: "signup" });
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
          maxWidth: 520,
          background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          borderRadius: 12,
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
          border: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 12, color: "#e6eef6" }}>Create account</h2>
        <p style={{ marginTop: 0, marginBottom: 20, color: "rgba(255,255,255,0.7)" }}>
          Sign up to save your conversations and interact with the Gemini-powered assistant.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <CustomizedInput type="text" name="name" label="Full name" />
          <CustomizedInput type="email" name="email" label="Email" />
          <CustomizedInput type="password" name="password" label="Password" />
          <CustomizedInput type="password" name="confirmPassword" label="Confirm password" />

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
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(255,255,255,0.65)" }}>
          <small>Already have an account?</small>
          <Link to="/login" style={{ textDecoration: "none" }}>
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
              Sign in
            </button>
          </Link>
        </div>

        <div style={{ marginTop: 12, color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
          <p style={{ margin: 0 }}>
            By creating an account you agree to the project usage policy. Gemini responses may be imperfect — always verify critical content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
