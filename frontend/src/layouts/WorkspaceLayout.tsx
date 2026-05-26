import { Outlet } from "react-router-dom";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { cn } from "@/lib/utils";

interface WorkspaceLayoutProps {
  workspaceType: "rag" | "gemini";
}

const WorkspaceLayout = ({ workspaceType }: WorkspaceLayoutProps) => {
  return (
    <div className="bg-hero flex h-screen pt-16 overflow-hidden">
      <WorkspaceSidebar workspaceType={workspaceType} />
      <main className={cn("flex-1 overflow-y-auto", workspaceType === "gemini" ? "scrollbar-thin-gemini" : "scrollbar-thin")}>
        <Outlet />
      </main>
    </div>
  );
};

export default WorkspaceLayout;
