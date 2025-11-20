// frontend/src/rag/components/RagLayout.tsx
import React, { useEffect, useState } from "react";
import RagSidebar from "./RagSidebar";
import { Outlet, useLocation } from "react-router-dom";

const RagLayout: React.FC = () => {
  const location = useLocation();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <RagSidebar
        key={location.pathname}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default RagLayout;
