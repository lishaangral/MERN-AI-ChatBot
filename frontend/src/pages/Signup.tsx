// // frontend/src/pages/Signup.tsx

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FloatingOrbs from "@/components/FloatingOrbs";
import { motion } from "framer-motion";
import { useState } from "react";
import { UserPlus, Eye, EyeOff, Shield } from "lucide-react";
import { signupUser } from "../helpers/api-communicator";
import { toast } from "react-hot-toast";

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
        toast.error("Please fill in all required fields.");
        return;
    }

    if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
    }

    try {
        setIsSubmitting(true);

        toast.loading("Creating account...", { id: "signup" });

        await signupUser(fullName.trim(), email.trim(), password);

        toast.success("Account created successfully", { id: "signup" });

        navigate("/login");
    } catch (err: any) {
        console.error("Signup error", err);

        const backendMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data || err.response?.data?.message
        err.message || "Signup failed. Please try again.";

        toast.error(backendMessage, { id: "signup" });
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
            <h1 className="font-heading text-2xl font-bold text-hero-foreground">Create Your Account</h1>
            <p className="mt-1 text-sm text-surface-foreground/70">Join ScholarMind — it's completely free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-surface-foreground/80">Full Name</Label>
              <Input
                id="fullName"
                name="name"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border-white/10 bg-white/5 text-hero-foreground placeholder:text-surface-foreground/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-surface-foreground/80">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="Example: you@university.edu"
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
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-surface-foreground/80">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-white/10 bg-white/5 text-hero-foreground placeholder:text-surface-foreground/40"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
              <UserPlus className="mr-2 h-4 w-4" /> Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-foreground/60">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in here
            </Link>
          </div>

          <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-surface-foreground/40 leading-relaxed">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
              <p>
                <strong>Your privacy matters.</strong> Passwords are securely hashed and never stored in plain text. Your uploaded documents remain private and are only accessible within your account. We do not share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
