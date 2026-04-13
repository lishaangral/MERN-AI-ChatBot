// // frontend/src/pages/Login.tsx

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FloatingOrbs from "@/components/FloatingOrbs";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { loginUser } from "../helpers/api-communicator";
import { LogIn, Eye, EyeOff, Info } from "lucide-react";
import { toast } from "react-hot-toast";

const Login: React.FC = () => {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
        toast.error("Please provide email and password");
        return;
    }

    try {
        setIsSubmitting(true);
        toast.loading("Signing in...", { id: "login" });
        await auth?.login(email.trim(), password.trim());
        await loginUser(email.trim(), password.trim());
        toast.success("Signed in successfully", { id: "login" });
        navigate("/dashboard");
    } catch (err) {
        console.error(err);
        const backendMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data || err.response?.data?.message
        err.message || "Sign In failed. Please try again.";
        toast.error(backendMessage, { id: "login" });
    } finally {
        setIsSubmitting(false);
    }
    };

  return (
    <div className="bg-hero flex min-h-screen items-center justify-center px-4 pt-16">
      <FloatingOrbs />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-surface p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-2xl font-bold text-hero-foreground">Welcome Back</h1>
            <p className="mt-1 text-sm text-surface-foreground/70">Log in to your ScholarMind account</p>
          </div>

          {/* Sample credentials */}
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-xs text-surface-foreground/80">
                <p className="font-semibold text-primary">Demo Credentials</p>
                <p className="mt-1">Email: <span className="font-mono">demo@gmail.com</span></p>
                <p>Password: <span className="font-mono">demo@1234</span></p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-surface-foreground/80">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-white/10 bg-white/5 text-hero-foreground placeholder:text-surface-foreground/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-surface-foreground/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-white/10 bg-white/5 pr-10 text-hero-foreground placeholder:text-surface-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-foreground/50 hover:text-surface-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
              <LogIn className="mr-2 h-4 w-4" /> {isSubmitting ? "Signing in..." : "Log In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-foreground/60">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create one here
            </Link>
          </div>

          <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-surface-foreground/40 leading-relaxed">
            <p><strong>Disclaimer:</strong> ScholarMind is a research assistance tool. Responses from the RAG workspace are based on your uploaded documents. Gemini Chat responses are generated by Google's AI and may not always be accurate. Always verify critical information with original sources.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
