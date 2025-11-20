import "./App.css";
import Header from "./components/Header";
import { Routes, Route, useParams } from "react-router-dom";
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

const RagUploadWrapper = () => {
  const { projectId } = useParams();
  return <RagUpload projectId={projectId!} />;
};

const RagChatWrapper = () => {
  const { projectId } = useParams();
  return <RagChat projectId={projectId!} />;
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

        <Route
          path="/rag"
          element={
            <RagLayout>
              <RagHome />
            </RagLayout>
          }
        />

        <Route
          path="/rag/project/:projectId"
          element={
            <RagLayout>
              <RagProjectDashboard />
            </RagLayout>
          }
        />

        <Route
          path="/rag/project/:projectId/upload"
          element={
            <RagLayout>
              <RagUploadWrapper />
            </RagLayout>
          }
        />

        <Route
          path="/rag/project/:projectId/chat"
          element={
            <RagLayout>
              <RagChatWrapper />
            </RagLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
