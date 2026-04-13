// frontend/src/components/Header.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Header: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isWorkspace = location.pathname.startsWith("/rag") || location.pathname.startsWith("/gemini");
  const isDashboard = location.pathname.startsWith("/dashboard") || isWorkspace;

  const handleLogout = async () => {
    setLogoutOpen(false);
    setMobileOpen(false);

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
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg font-bold text-hero-foreground">
              ScholarMind
            </span>
          </Link>

          {/* Desktop nav */}
          {!isDashboard && !auth?.isLoggedIn && (
            <nav className="hidden items-center gap-3 md:flex">
              <Button variant="glass" size="sm" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/signup">Sign Up Free</Link>
              </Button>
            </nav>
          )}

          {!isDashboard && auth?.isLoggedIn && (
            <nav className="hidden items-center gap-3 md:flex">
              <Button variant="glass" size="sm" asChild className="gap-2">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button variant="glass" size="sm" className="gap-2"
                  onClick={() => setLogoutOpen(true)}>
                <LogOut className="h-4 w-4" /> Log Out
              </Button>
            </nav>
          )}

          {isDashboard && auth?.isLoggedIn && (
            <nav className="hidden items-center gap-3 md:flex">
              {isWorkspace && (
                <Button variant="glass" size="sm" asChild className="gap-2">
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </Button>
              )}
              <Button variant="glass" size="sm" className="gap-2"
                  onClick={() => setLogoutOpen(true)}>
                <LogOut className="h-4 w-4" /> Log Out
              </Button>
            </nav>
          )}

          {/* Mobile hamburger */}
          <button
            className="text-hero-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass md:hidden"
            >
              <div className="flex flex-col gap-2 p-4">
                {(isDashboard && auth?.isLoggedIn) ? (
                  <>
                    {isWorkspace && (
                      <Button variant="glass" asChild onClick={() => setMobileOpen(false)}>
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                    )}
                    <Button variant="glass" className="gap-2" onClick={() => {setMobileOpen(false); setLogoutOpen(true);}}>
                      <LogOut className="h-4 w-4" /> Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="glass" asChild onClick={() => setMobileOpen(false)}>
                      <Link to="/login">Log In</Link>
                    </Button>
                    <Button variant="hero" asChild onClick={() => setMobileOpen(false)}>
                      <Link to="/signup">Sign Up Free</Link>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Logout Confirmation Modal */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="border-white/10 bg-surface backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-hero-foreground">
              <LogOut className="h-5 w-5 text-destructive" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-surface-foreground/70">
              Are you sure you want to log out? You'll need to sign in again to access your workspaces and projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-hero-foreground hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLogout}
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Header;
