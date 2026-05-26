const FloatingOrbs = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-float" />
    <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-float-delayed" />
    <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-float-slow" />
    <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent/5 blur-2xl animate-pulse-glow" />
  </div>
);

export default FloatingOrbs;
