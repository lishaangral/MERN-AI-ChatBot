import React, { useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import RagSidebar from "../components/RagSidebar";

const HEADER_HEIGHT = 64; // height of top navbar

const RagLayout: React.FC = () => {
  const { projectId, chatId } = useParams();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    projectId || null
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(
    chatId || null
  );

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <RagSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />

      {/* MAIN CONTENT */}
      <main
        style={{
          marginLeft: collapsed ? 80 : 300,
          transition: "margin-left 0.25s ease",
          width: "100%",
          paddingTop: HEADER_HEIGHT,
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default RagLayout;
