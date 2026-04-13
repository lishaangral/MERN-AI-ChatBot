// // frontend/src/pages/Home.tsx
// import React from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../context/useAuth";

// const Home: React.FC = () => {
//   const auth = useAuth();

//   return (
//     <div>
//       {/* Hero section */}
//       <h1
//         style={{
//           fontSize: "3rem",
//           fontWeight: 700,
//           marginBottom: "1rem",
//           background: "linear-gradient(90deg, #00ffcc, #2563eb)",
//           WebkitBackgroundClip: "text",
//           WebkitTextFillColor: "transparent",
//         }}
//       >
//         MERN AI ChatBot
//       </h1>

//       <p
//         style={{
//           maxWidth: "650px",
//           fontSize: "1.25rem",
//           marginBottom: "2rem",
//           color: "rgba(255,255,255,0.85)",
//         }}
//       >
//         A modern conversational AI assistant powered by{" "}
//         <span style={{ fontWeight: 600, color: "#00ffcc" }}>Gemini API</span>,
//         featuring real-time chat, persistent history, document-backed RAG
//         intelligence, and a clean responsive interface.
//       </p>

//       {/* CTA buttons */}
//       <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
//         {auth?.isLoggedIn ? (
//           <>
//             <Link
//               to="/chat"
//               style={{
//                 background: "#00ffcc",
//                 color: "#000",
//                 padding: "0.75rem 1.5rem",
//                 borderRadius: 8,
//                 fontWeight: 600,
//                 textDecoration: "none",
//               }}
//             >
//               Go to Chats
//             </Link>

//             <Link
//               to="/rag"
//               style={{
//                 background: "#2563eb",
//                 color: "#fff",
//                 padding: "0.75rem 1.5rem",
//                 borderRadius: 8,
//                 fontWeight: 600,
//                 textDecoration: "none",
//               }}
//             >
//               RAG Workspace
//             </Link>
//           </>
//         ) : (
//           <>
//             <Link
//               to="/login"
//               style={{
//                 background: "#00ffcc",
//                 color: "#000",
//                 padding: "0.75rem 1.5rem",
//                 borderRadius: 8,
//                 fontWeight: 600,
//                 textDecoration: "none",
//               }}
//             >
//               Login
//             </Link>

//             <Link
//               to="/signup"
//               style={{
//                 background: "#2563eb",
//                 color: "#fff",
//                 padding: "0.75rem 1.5rem",
//                 borderRadius: 8,
//                 fontWeight: 600,
//                 textDecoration: "none",
//               }}
//             >
//               Signup
//             </Link>
//           </>
//         )}
//       </div>

//       {/* Features */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
//           gap: "1.5rem",
//           maxWidth: "900px",
//           width: "100%",
//           marginTop: "3rem",
//         }}
//       >
//         <FeatureCard
//           title="⚡ Fast Responses"
//           desc="Powered by Gemini API for quick and intelligent conversations."
//         />
//         <FeatureCard
//           title="🔒 Secure"
//           desc="Authentication and chat history stored securely with MongoDB."
//         />
//         <FeatureCard
//           title="💬 Persistent Chats"
//           desc="Access previous conversations anytime with an intuitive sidebar."
//         />
//         <FeatureCard
//           title="🎨 Clean UI"
//           desc="Minimal, responsive, and user-friendly design for a smooth experience."
//         />
//         <FeatureCard
//           title="🛠️ Custom Prompts"
//           desc="Tailor conversations for coding, research, writing, and more."
//         />
//         <FeatureCard
//           title="🌐 Cross-Platform"
//           desc="Use your chatbot seamlessly from any device."
//         />

//         {/* NEW RAG FEATURES */}
//         <FeatureCard
//           title="📚 Intelligent RAG Workspace"
//           desc="Upload scientific papers, plant pathology notes, or reports and ask document-aware research questions."
//           highlight
//         />

//         <FeatureCard
//           title="🔍 Retrieval-Augmented Answers"
//           desc="The system finds relevant text in your uploaded files, processes it using embeddings, and generates grounded responses."
//           highlight
//         />
//       </div>
//     </div>
//   );
// };

// const FeatureCard = ({
//   title,
//   desc,
//   highlight = false,
// }: {
//   title: string;
//   desc: string;
//   highlight?: boolean;
// }) => (
//   <div
//     style={{
//       padding: "1.5rem",
//       borderRadius: 12,
//       background: highlight
//         ? "rgba(0,255,204,0.08)"
//         : "rgba(255,255,255,0.05)",
//       textAlign: "left",
//       border: highlight ? "1px solid #00ffcc33" : "none",
//     }}
//   >
//     <h3 style={{ marginBottom: "0.5rem", color: "#00ffcc" }}>{title}</h3>
//     <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>{desc}</p>
//   </div>
// );

// export default Home;

import { Link } from "react-router-dom";
import React from "react";
import { Button } from "@/components/ui/button";
import FloatingOrbs from "@/components/FloatingOrbs";
import DeveloperCard from "@/components/DeveloperCard";
import { motion } from "framer-motion";
import { FileSearch, MessageSquare, ArrowRight, Shield, Zap, BookOpenCheck, Brain, Upload, Search } from "lucide-react";
import { useAuth } from "../context/useAuth";

const features = [
  {
    icon: FileSearch,
    title: "RAG Workspace",
    desc: "Upload your research documents and get fact-based, citation-backed answers. No hallucination — every response is grounded in your uploaded content.",
    color: "text-primary",
  },
  {
    icon: MessageSquare,
    title: "Gemini Chat",
    desc: "Chat freely with Google's Gemini API for open-ended exploration, brainstorming, and general knowledge queries.",
    color: "text-accent",
  },
  {
    icon: Brain,
    title: "RAG → Chat Pipeline",
    desc: "First search your documents in RAG, then plug the verified response into Gemini Chat to diversify and deepen your research.",
    color: "text-primary",
  },
];

const benefits = [
  { icon: Shield, text: "No subscription walls" },
  { icon: Zap, text: "Instant document search" },
  { icon: BookOpenCheck, text: "Citation-backed responses" },
];

const howItWorks = [
  { step: "01", icon: Upload, title: "Upload Documents", desc: "Drop your PDFs, papers, or notes into your RAG workspace." },
  { step: "02", icon: Search, title: "Search & Verify", desc: "Ask questions and receive responses backed by your actual documents." },
  { step: "03", icon: Brain, title: "Extend with AI", desc: "Plug verified answers into Gemini Chat for broader exploration." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Home: React.FC = () => {
  const auth = useAuth();

  return (
    <div className="bg-hero min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16">
        <FloatingOrbs />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Free for Students & Researchers
            </span>
            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-hero-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Research Smarter with{" "}
              <span className="text-gradient">AI That Cites</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-foreground/80">
              Upload your documents, ask questions, and get fact-based responses backed by your own research.
              No hallucination. No subscriptions. Built for students and researchers.
            </p>
            
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {!auth?.isLoggedIn ? (
                    <>
                        <Button variant="hero" size="lg" asChild>
                          <Link to="/signup">
                          Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="hero-outline" size="lg" asChild>
                          <Link to="/login">Log In</Link>
                        </Button>
                    </>
                    
                ) : (
                    <>
                        <Button variant="hero" size="lg" asChild>
                        <Link to="/rag">
                        RAG Workspace <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        </Button>
                        <Button variant="hero-outline" size="lg" asChild>
                        <Link to="/gemini">Gemini Workspace</Link>
                        </Button>
                    </>
                )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center font-heading text-3xl font-bold text-hero-foreground sm:text-4xl"
          >
            Two Workspaces. One Mission.
          </motion.h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-surface-foreground/70">
            Combine document-grounded search with open AI chat for a complete research workflow.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group rounded-2xl border border-white/5 bg-surface p-8 transition-all hover:glow-border"
              >
                <div className={`mb-4 inline-flex rounded-xl bg-white/5 p-3 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-hero-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-foreground/70">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center font-heading text-3xl font-bold text-hero-foreground sm:text-4xl"
          >
            How It Works
          </motion.h2>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative text-center"
              >
                <span className="font-heading text-5xl font-bold text-primary/20">{item.step}</span>
                <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-hero-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-surface-foreground/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="border-y border-white/5 px-4 py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8">
          {benefits.map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-surface-foreground/80">
              <b.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 py-24">
        <FloatingOrbs />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-hero-foreground sm:text-4xl">
            Ready to Supercharge Your Research?
          </h2>
          <p className="mt-4 text-surface-foreground/70">
            Join students and researchers who search smarter — without worrying about hallucinated answers or subscriptions.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Developer */}
      <DeveloperCard />

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-surface-foreground/50">
          © {new Date().getFullYear()} ScholarMind. Built to help students and researchers search without limits.
        </div>
      </footer>
    </div>
  );
};

export default Home;
