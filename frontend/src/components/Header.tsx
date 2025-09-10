// frontend/src/components/Header.tsx
import React, { useState } from "react";
import Logo from "./shared/Logo";
import { useAuth } from "../context/useAuth";
import ConfirmModal from "./shared/ConfirmModal";
import { useNavigate, Link } from "react-router-dom";
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
            <div className="logo-wrapper">
              <Logo />
            </div>
          </div>

          <div className="header-right">
            <nav className="nav-links">
              {auth?.isLoggedIn ? (
                <>
                  <Link to="/chat">
                    <button className="nav-button nav-button-primary">Go To Chat</button>
                  </Link>
                  <button
                    type="button"
                    className="nav-button nav-button-ghost"
                    onClick={onLogoutClick}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className="nav-button nav-button-primary">Login</button>
                  </Link>
                  <Link to="/signup">
                    <button className="nav-button nav-button-secondary">Signup</button>
                  </Link>
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
