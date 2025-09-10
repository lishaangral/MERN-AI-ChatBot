// frontend/src/pages/Login.tsx
import React from "react";
import CustomizedInput from "../components/shared/CustomizedInput";
import { useAuth } from "../context/useAuth";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      toast.loading("Signing In...", { id: "login" });
      await auth?.login(email, password);
      toast.success("Signed In Successfully", { id: "login" });

      // ✅ Redirect to chat after login
      navigate("/chat");
    } catch (error) {
      console.error(error);
      toast.error("Signing In Failed", { id: "login" });
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <CustomizedInput type="email" name="email" label="Email" />
          <CustomizedInput type="password" name="password" label="Password" />
          <button
            type="submit"
            style={{
              padding: "0.6rem 1rem",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
