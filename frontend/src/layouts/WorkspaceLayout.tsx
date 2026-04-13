import { Outlet } from "react-router-dom";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";

interface WorkspaceLayoutProps {
  workspaceType: "rag" | "chat";
}

const WorkspaceLayout = ({ workspaceType }: WorkspaceLayoutProps) => {
  return (
    <div className="bg-hero flex h-screen pt-16 overflow-hidden">
      <WorkspaceSidebar workspaceType={workspaceType} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default WorkspaceLayout;
