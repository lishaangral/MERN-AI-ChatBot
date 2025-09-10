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

  const onLogoutClick = () => setShowLogoutConfirm(true);

  const onConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      const ok = await auth?.logout();
      if (ok) {
        toast.success("Logged out successfully");
        navigate("/");
      } else {
        toast.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error", err);
      toast.error("Logout error");
      navigate("/");
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="header-left">
            <div className="logo-wrapper" aria-hidden>
              <Logo />
            </div>
          </div>

          <div className="header-right">
            {/* desktop nav */}
            <nav className="nav-links">
              {auth?.isLoggedIn ? (
                <>
                  <NavigationLink bg="#00ffcc" to="/chat" text="Go To Chat" textColor="#042" />
                  <button
                    type="button"
                    className="nav-button nav-button-ghost"
                    onClick={onLogoutClick}
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavigationLink bg="#00ffcc" to="/login" text="Login" textColor="#042" />
                  <NavigationLink bg="#595fffff" to="/signup" text="Signup" textColor="#fff" />
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Logout"
        description="Are you sure you want to logout?"
        onConfirm={onConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Header;
