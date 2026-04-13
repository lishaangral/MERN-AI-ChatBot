// import "./App.css";
// import { useEffect } from "react";
// import Header from "./components/Header";
// import { Routes, Route, useParams, useNavigate} from "react-router-dom";
// import Home from "./pages/Home";
// import Chat from "./pages/Chat";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Dashboard from "./pages/Dashboard";
// import NotFound from "./pages/NotFound";
// import { useAuth } from "./context/useAuth";
// import RagHome from "./rag/pages/RagHome";
// import RagUpload from "./rag/pages/RagUpload";
// import RagChat from "./rag/pages/RagChat";
// import RagProjectDashboard from "./rag/pages/RagProjectDashboard";
// import RagLayout from "./rag/components/RagLayout";

// const CreateProjectRedirect = () => {
//   const navigate = useNavigate();
//   const id = crypto.randomUUID();
//   navigate(`/rag/project/${id}`);
//   return null;
// };

// const OpenMostRecentProject = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     // fetch recent project id (from API or state)
//     const recentId = localStorage.getItem("recent_project");
//     if (recentId) navigate(`/rag/project/${recentId}`);
//     else navigate("/rag"); // fallback
//   }, []);

//   return null;
// };


// function App() {
//   // console.log(useAuth()?.isLoggedIn)
//   const auth = useAuth();
//   return (
//     <>
//       <Header></Header>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         {auth?.isLoggedIn && auth.user && (
//           <Route path="/chat" element={<Chat />} />
//         )}
//         <Route path="*" element={<NotFound />} />

//         <Route path="/rag" element={<RagLayout />}>
//           <Route index element={<RagHome />} />
//           <Route path="project/:projectId" element={<RagProjectDashboard />} />
//           <Route path="project/:projectId/upload" element={<RagUpload />} />
//           <Route path="project/:projectId/chat" element={<RagChat />} />
//           <Route
//             path="project/:projectId/chat/:chatId?"
//             element={<RagChat />}
//           />
//           <Route path="/rag/new" element={<CreateProjectRedirect />} />
//           <Route path="/rag/recent" element={<OpenMostRecentProject />} />
//         </Route>
//       </Routes>
//     </>
//   );
// }

// export default App;

// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import {Toaster} from 'react-hot-toast';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { useEffect } from "react";
import { useAuth } from "./context/useAuth";
import Header from "@/components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import WorkspaceLayout from "./layouts/WorkspaceLayout";
import RagLanding from "./pages/rag/RagLanding";
import NewProject from "./pages/rag/NewProject";
import ProjectPage from "./pages/rag/ProjectPage";
import UploadDocuments from "./pages/rag/UploadDocuments";
import ChatPage from "./pages/rag/ChatPage";
import ChatLanding from "./pages/chat/ChatLanding";
import GeminiStandaloneChat from "./pages/chat/GeminiStandaloneChat";
import { WorkspaceProvider } from "./context/WorkspaceContext";


const queryClient = new QueryClient();

function App() {
  const auth = useAuth();
  return (
    <>
      <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WorkspaceProvider>
          <Toaster position="top-right" />
          <Sonner />
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {auth?.isLoggedIn && auth.user && (
                <Route path="/dashboard" element={<Dashboard />} />
              )}
                {/* RAG Workspace */}
              {auth?.isLoggedIn && auth.user && (
                <Route path="/rag" element={<WorkspaceLayout workspaceType="rag" />}>
                  <Route index element={<RagLanding />} />
                  <Route path="new-project" element={<NewProject />} />
                  <Route path="project/:projectId" element={<ProjectPage />} />
                  <Route path="project/:projectId/upload" element={<UploadDocuments />} />
                  <Route path="project/:projectId/chat/:chatId" element={<ChatPage />} />
                </Route>
              )}
                {/* Gemini Chat Workspace */}
              {auth?.isLoggedIn && auth.user && (
                <Route path="/gemini" element={<WorkspaceLayout workspaceType="chat" />}>
                  <Route index element={<ChatLanding />} />
                  <Route path="new-project" element={<NewProject />} />
                  <Route path="project/:projectId" element={<ProjectPage />} />
                  <Route path="project/:projectId/upload" element={<UploadDocuments />} />
                  <Route path="project/:projectId/chat/:chatId" element={<ChatPage />} />
                  <Route path="chat/:chatId" element={<GeminiStandaloneChat />} />
                </Route>
              )}            

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WorkspaceProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </>
  );
}

export default App;
