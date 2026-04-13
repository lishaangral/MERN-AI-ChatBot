import { createContext, useContext, useState, ReactNode } from "react";

export interface ChatItem {
  id: string;
  name: string;
  createdAt: Date;
  pluggedToGemini?: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt";
  size: string;
  uploadedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  documents: DocumentItem[];
  chats: ChatItem[];
  createdAt: Date;
}

export interface GeminiStandaloneChat {
  id: string;
  name: string;
  createdAt: Date;
}

interface WorkspaceContextType {
  projects: Project[];
  geminiProjects: Project[];
  geminiStandaloneChats: GeminiStandaloneChat[];
  addProject: (name: string, description?: string) => string;
  deleteProject: (id: string) => void;
  addGeminiProject: (name: string, description?: string) => string;
  deleteGeminiProject: (id: string) => void;
  addDocument: (projectId: string, doc: Omit<DocumentItem, "id" | "uploadedAt">) => void;
  deleteDocument: (projectId: string, docId: string) => void;
  addChat: (projectId: string, name: string) => string;
  deleteChat: (projectId: string, chatId: string) => void;
  getProjectForWorkspace: (id: string, isGemini: boolean) => Project | undefined;
  plugChatToGemini: (projectId: string, chatId: string) => void;
  getPluggedProjects: () => Project[];
  addGeminiStandaloneChat: (name: string) => string;
  deleteGeminiStandaloneChat: (chatId: string) => void;
  addGeminiChat: (projectId: string, name: string) => string;
  deleteGeminiChat: (projectId: string, chatId: string) => void;
  plugProjectToRag: (geminiProjectId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Machine Learning Research",
    description: "Research papers on transformer architectures and attention mechanisms.",
    documents: [
      { id: "doc-1", name: "Attention Is All You Need.pdf", type: "pdf", size: "2.4 MB", uploadedAt: new Date("2026-02-15") },
      { id: "doc-2", name: "BERT_Paper.pdf", type: "pdf", size: "1.8 MB", uploadedAt: new Date("2026-02-20") },
    ],
    chats: [
      { id: "chat-1", name: "Transformer Architecture Q&A", createdAt: new Date("2026-02-16") },
      { id: "chat-2", name: "Attention Mechanisms", createdAt: new Date("2026-02-21") },
    ],
    createdAt: new Date("2026-02-15"),
  },
  {
    id: "proj-2",
    name: "Climate Change Studies",
    description: "Collection of IPCC reports and climate data analysis papers.",
    documents: [
      { id: "doc-3", name: "IPCC_2025_Summary.pdf", type: "pdf", size: "5.1 MB", uploadedAt: new Date("2026-03-01") },
    ],
    chats: [
      { id: "chat-3", name: "Global Temperature Trends", createdAt: new Date("2026-03-02") },
    ],
    createdAt: new Date("2026-03-01"),
  },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [geminiProjects, setGeminiProjects] = useState<Project[]>([]);
  const [geminiStandaloneChats, setGeminiStandaloneChats] = useState<GeminiStandaloneChat[]>([]);
  // Plugged chats: Map<projectId, ChatItem[]> - chats cloned from RAG into Gemini
  const [pluggedChats, setPluggedChats] = useState<Map<string, ChatItem[]>>(new Map());
  // Gemini-native chats created within plugged projects
  const [geminiNativeChats, setGeminiNativeChats] = useState<Map<string, ChatItem[]>>(new Map());

  const addProject = (name: string, description?: string) => {
    const id = `proj-${Date.now()}`;
    setProjects((prev) => [
      { id, name, description, documents: [], chats: [], createdAt: new Date() },
      ...prev,
    ]);
    return id;
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const addGeminiProject = (name: string, description?: string) => {
    const id = `gproj-${Date.now()}`;
    setGeminiProjects((prev) => [
      { id, name, description, documents: [], chats: [], createdAt: new Date() },
      ...prev,
    ]);
    return id;
  };

  const deleteGeminiProject = (id: string) => {
    setGeminiProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const addDocument = (projectId: string, doc: Omit<DocumentItem, "id" | "uploadedAt">) => {
    const newDoc = { ...doc, id: `doc-${Date.now()}`, uploadedAt: new Date() };
    // Add to whichever store has this project
    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, documents: [...p.documents, newDoc] } : p)
    );
    setGeminiProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, documents: [...p.documents, newDoc] } : p)
    );
  };

  const deleteDocument = (projectId: string, docId: string) => {
    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, documents: p.documents.filter((d) => d.id !== docId) } : p)
    );
    setGeminiProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, documents: p.documents.filter((d) => d.id !== docId) } : p)
    );
  };

  const addChat = (projectId: string, name: string) => {
    const chatId = `chat-${Date.now()}`;
    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, chats: [...p.chats, { id: chatId, name, createdAt: new Date() }] } : p)
    );
    // Also for gemini projects
    setGeminiProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, chats: [...p.chats, { id: chatId, name, createdAt: new Date() }] } : p)
    );
    return chatId;
  };

  const deleteChat = (projectId: string, chatId: string) => {
    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, chats: p.chats.filter((c) => c.id !== chatId) } : p)
    );
  };

  const getProjectForWorkspace = (id: string, isGemini: boolean): Project | undefined => {
    if (isGemini) {
      // Check gemini-native projects first
      const gProject = geminiProjects.find((p) => p.id === id);
      if (gProject) return gProject;

      // Check plugged projects (RAG projects that have plugged chats)
      const ragProject = projects.find((p) => p.id === id);
      if (!ragProject) return undefined;
      const pChats = pluggedChats.get(id) || [];
      const nChats = geminiNativeChats.get(id) || [];
      if (pChats.length === 0 && nChats.length === 0) return undefined;
      return { ...ragProject, chats: [...pChats, ...nChats] };
    } else {
      // RAG workspace: only show RAG projects with RAG chats
      return projects.find((p) => p.id === id);
    }
  };

  const plugChatToGemini = (projectId: string, chatId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const chat = project?.chats.find((c) => c.id === chatId);
    if (!chat) return;
    // Clone the chat into plugged chats with a new ID
    const clonedChat: ChatItem = {
      id: `plugged-${Date.now()}`,
      name: chat.name,
      createdAt: new Date(),
      pluggedToGemini: true,
    };
    setPluggedChats((prev) => {
      const next = new Map(prev);
      const existing = next.get(projectId) || [];
      next.set(projectId, [...existing, clonedChat]);
      return next;
    });
  };

  const getPluggedProjects = (): Project[] => {
    return projects
      .map((p) => {
        const pChats = pluggedChats.get(p.id) || [];
        const nChats = geminiNativeChats.get(p.id) || [];
        if (pChats.length === 0 && nChats.length === 0) return null;
        return { ...p, chats: [...pChats, ...nChats] };
      })
      .filter(Boolean) as Project[];
  };

  const addGeminiStandaloneChat = (name: string) => {
    const id = `gemini-chat-${Date.now()}`;
    setGeminiStandaloneChats((prev) => [{ id, name, createdAt: new Date() }, ...prev]);
    return id;
  };

  const deleteGeminiStandaloneChat = (chatId: string) => {
    setGeminiStandaloneChats((prev) => prev.filter((c) => c.id !== chatId));
  };

  const addGeminiChat = (projectId: string, name: string) => {
    const chatId = `gemini-pchat-${Date.now()}`;
    // For gemini-native projects, add directly
    const isGeminiProject = geminiProjects.some((p) => p.id === projectId);
    if (isGeminiProject) {
      setGeminiProjects((prev) =>
        prev.map((p) => p.id === projectId ? { ...p, chats: [...p.chats, { id: chatId, name, createdAt: new Date() }] } : p)
      );
    } else {
      // For plugged projects, add to geminiNativeChats
      setGeminiNativeChats((prev) => {
        const next = new Map(prev);
        const existing = next.get(projectId) || [];
        next.set(projectId, [...existing, { id: chatId, name, createdAt: new Date() }]);
        return next;
      });
    }
    return chatId;
  };

  const deleteGeminiChat = (projectId: string, chatId: string) => {
    // Remove from plugged chats
    setPluggedChats((prev) => {
      const next = new Map(prev);
      const existing = next.get(projectId) || [];
      next.set(projectId, existing.filter((c) => c.id !== chatId));
      return next;
    });
    // Remove from gemini native chats
    setGeminiNativeChats((prev) => {
      const next = new Map(prev);
      const existing = next.get(projectId) || [];
      next.set(projectId, existing.filter((c) => c.id !== chatId));
      return next;
    });
    // Remove from gemini projects
    setGeminiProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, chats: p.chats.filter((c) => c.id !== chatId) } : p)
    );
  };

  const plugProjectToRag = (geminiProjectId: string) => {
    const gProject = geminiProjects.find((p) => p.id === geminiProjectId);
    if (!gProject) return;
    // Create a new RAG project with same name, description, documents but no chats
    const newId = `proj-${Date.now()}`;
    setProjects((prev) => [
      { id: newId, name: gProject.name, description: gProject.description, documents: [...gProject.documents], chats: [], createdAt: new Date() },
      ...prev,
    ]);
    // Move documents reference - the project now exists in both workspaces via plugged mechanism
    // Remove from gemini projects
    setGeminiProjects((prev) => prev.filter((p) => p.id !== geminiProjectId));
    // Move gemini chats to plugged area under the new RAG project ID
    const gChats = gProject.chats.map((c) => ({ ...c, pluggedToGemini: true }));
    if (gChats.length > 0) {
      setPluggedChats((prev) => {
        const next = new Map(prev);
        next.set(newId, gChats);
        return next;
      });
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        geminiProjects,
        geminiStandaloneChats,
        addProject,
        deleteProject,
        addGeminiProject,
        deleteGeminiProject,
        addDocument,
        deleteDocument,
        addChat,
        deleteChat,
        getProjectForWorkspace,
        plugChatToGemini,
        getPluggedProjects,
        addGeminiStandaloneChat,
        deleteGeminiStandaloneChat,
        addGeminiChat,
        deleteGeminiChat,
        plugProjectToRag,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export { WorkspaceContext };