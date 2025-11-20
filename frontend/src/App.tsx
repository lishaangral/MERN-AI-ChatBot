import "./App.css";
import { useEffect } from "react";
import Header from "./components/Header";
import { Routes, Route, useParams, useNavigate} from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/useAuth";
import RagHome from "./rag/pages/RagHome";
import RagUpload from "./rag/pages/RagUpload";
import RagChat from "./rag/pages/RagChat";
import RagProjectDashboard from "./rag/pages/RagProjectDashboard";
import RagLayout from "./rag/components/RagLayout";

const CreateProjectRedirect = () => {
  const navigate = useNavigate();
  const id = crypto.randomUUID();
  navigate(`/rag/project/${id}`);
  return null;
};

const OpenMostRecentProject = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // fetch recent project id (from API or state)
    const recentId = localStorage.getItem("recent_project");
    if (recentId) navigate(`/rag/project/${recentId}`);
    else navigate("/rag"); // fallback
  }, []);

  return null;
};


function App() {
  // console.log(useAuth()?.isLoggedIn)
  const auth = useAuth();
  return (
    <>
      <Header></Header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {auth?.isLoggedIn && auth.user && (
          <Route path="/chat" element={<Chat />} />
        )}
        <Route path="*" element={<NotFound />} />

        <Route path="/rag" element={<RagLayout />}>
          <Route index element={<RagHome />} />
          <Route path="project/:projectId" element={<RagProjectDashboard />} />
          <Route path="project/:projectId/upload" element={<RagUpload />} />
          <Route path="project/:projectId/chat" element={<RagChat />} />
          <Route
            path="project/:projectId/chat/:chatId?"
            element={<RagChat />}
          />
          <Route path="/rag/new" element={<CreateProjectRedirect />} />
          <Route path="/rag/recent" element={<OpenMostRecentProject />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
