// frontend/src/components/Header.tsx
import React, { useState } from "react";
import Logo from "./shared/Logo";
import { useAuth } from "../context/useAuth";
import NavigationLink from "./shared/NavigationLink";
import ConfirmModal from "./shared/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; 

const Header: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const onLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const onConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      const ok = await auth?.logout();
      if (ok) {
        toast.success("Logged out successfully");   // 👈 show success
        navigate("/");
      } else {
        toast.error("Logout failed");               // 👈 show error
      }
    } catch (err) {
      console.error("Logout error", err);
      toast.error("Logout error");
      navigate("/"); // still go home defensively
    }
  };
  
  return (
    <header style={{ display: "flex", alignItems: "center", padding: 12 }}>
      <Logo />
      <div style={{ flex: 1 }} />
      <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {auth?.isLoggedIn ? (
          <>
            <NavigationLink bg="#00ffcc" to="/chat" text="Go To Chat" textColor="white" />
            <button
              type="button"
              onClick={onLogoutClick}
              style={{
                background: "#595fffff",
                color: "white",
                borderRadius: 8,
                border: "none",
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavigationLink bg="#00ffcc" to="/login" text="Login" textColor="white" />
            <NavigationLink bg="#595fffff" textColor="white" to="/signup" text="Signup" />
          </>
        )}
      </nav>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Logout"
        description="Are you sure you want to logout?"
        onConfirm={onConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
};

export default Header;
