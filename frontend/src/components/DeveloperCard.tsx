import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ExternalLink, MapPin, GraduationCap, Code2, Terminal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const socials = [
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/yourusername",
    color: "hover:text-hero-foreground",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://linkedin.com/in/yourusername",
    color: "hover:text-[hsl(210,80%,55%)]",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:your.email@example.com",
    color: "hover:text-primary",
  },
  {
    icon: ExternalLink,
    label: "Portfolio",
    href: "https://yourportfolio.dev",
    color: "hover:text-accent",
  },
];

const skills = ["React", "TypeScript", "Python", "Node.js", "GenAI", "RAG"];

const DeveloperCard = () => {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-4 text-center font-heading text-3xl font-bold text-hero-foreground sm:text-4xl"
        >
          Meet the Developer
        </motion.h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-sm text-surface-foreground/60">
          The mind behind ScholarMind — built with passion for accessible research tools.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface"
        >
          {/* Gradient accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="flex flex-col items-center gap-8 p-8 md:flex-row md:items-start md:p-10">
            {/* Avatar + quick info */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex shrink-0 flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-accent opacity-60 blur-md" />
                <Avatar className="relative h-28 w-28 border-2 border-white/10">
                  <AvatarImage src="/placeholder.svg" alt="Developer" />
                  <AvatarFallback className="bg-surface text-2xl font-bold text-primary">
                    YN
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Social links */}
              <div className="flex gap-3">
                {socials.map((s, i) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    whileHover={{ scale: 1.2, y: -2 }}
                    className={`rounded-lg border border-white/10 bg-white/5 p-2.5 text-surface-foreground/50 transition-colors ${s.color}`}
                    title={s.label}
                  >
                    <s.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-heading text-2xl font-bold text-hero-foreground">
                  Your Name
                </h3>
                <p className="mt-1 text-sm font-medium text-primary">
                  Software Engineer Aspirant
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-surface-foreground/50 md:justify-start"
              >
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" /> Pre-Final Year, B.Tech CS
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Your City, India
                </span>
              </motion.div>

              <Separator className="my-4 bg-white/10" />

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 }}
                className="text-sm leading-relaxed text-surface-foreground/70"
              >
                A pre-final year Computer Science student passionate about building intelligent, user-centric 
                software. Fascinated by the intersection of <strong className="text-hero-foreground">Generative AI</strong>, 
                {" "}<strong className="text-hero-foreground">information retrieval</strong>, and{" "}
                <strong className="text-hero-foreground">full-stack engineering</strong>. ScholarMind is a 
                testament to that curiosity — a tool designed to make research accessible, grounded, and hallucination-free.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55 }}
                className="mt-4"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-surface-foreground/40 mb-2">
                  <Terminal className="h-3.5 w-3.5" /> Tech Stack
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-surface-foreground/70"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="mt-5 flex items-center justify-center gap-2 text-xs text-surface-foreground/40 md:justify-start"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Open to internships, collaborations & freelance opportunities</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DeveloperCard;
