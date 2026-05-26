// frontend/src/helpers/api-communicator.ts
import axios from "axios";
axios.defaults.withCredentials = true;

type Citation = {
    chunk: string;
    source?: string;
    pageNumber?: number | null;
    preview?: string;
    score?: number;
    docId?: string;
  };

export const loginUser = async (email: string, password: string) => {
  const res = await axios.post("/user/login", { email, password }, { withCredentials: true });
  if (res.status !== 200) throw new Error("Unable to Login");
  return res.data;
};

export const signupUser = async (name: string, email: string, password: string) => {
  const res = await axios.post("/user/signup", { name, email, password });
  if (res.status !== 201) throw new Error("Unable to Signup");
  return res.data;
};

export const checkAuthStatus = async () => {
  const res = await axios.post("/user/auth-status", {}, { withCredentials: true });
  if (res.status !== 200) throw new Error("Unable to Authenticate");
  return res.data;
};

export const deleteAccount = async () => {
  const res = await axios.delete("/user/delete", { withCredentials: true });
  if (res.status !== 200) throw new Error("Unable to delete account");
  return res.data;
};

export const logoutUser = async () => {
  const res = await axios.get("/user/logout");
  if (res.status !== 200) throw new Error("Unable to logout");
  return res.data;
};

// Chats: create, list, get, delete
// export const createChatAPI = async (body: {
//   projectId?: string;
//   title?: string;
// }) => {
//   const res = await axios.post("/chat/create", body);
//   if (![200, 201].includes(res.status)) throw new Error("Unable to create chat");
//   return res.data;
// };

// export const getUserChats = async () => {
//   const res = await axios.get("/chat/all-chats");
//   if (res.status !== 200) throw new Error("Unable to fetch chats");
//   return res.data;
// };


// export const getChatById = async (chatId: string) => {
//   const res = await axios.get(`/chat/${chatId}`);
//   if (res.status !== 200) throw new Error("Unable to fetch chat");
//   return res.data;
// };

// export const deleteChatById = async (chatId: string) => {
//   const res = await axios.delete(`/chat/${chatId}`);
//   if (res.status !== 200) throw new Error("Unable to delete chat");
//   return res.data;
// };

// export const deleteUserChats = async () => {
//   const res = await axios.delete("/chat/delete");
//   if (res.status !== 200) throw new Error("Unable to delete chats");
//   return res.data;
// };

// Create a new RAG project
export const createRagProject = async (body: { name: string; description?: string }) => {
  const res = await axios.post("/rag/project", body);
  if (![200, 201].includes(res.status)) throw new Error("Unable to create RAG project");
  return res.data;
};

// Get all RAG projects
export const getAllRagProjects = async () => {
  const res = await axios.get("/rag/project/all");
  if (res.status !== 200) throw new Error("Unable to fetch RAG projects");
  return res.data;
};

// Get RAG project by ID
export const getRagProjectById = async (id: string) => {
  const res = await axios.get(`/rag/project/${id}`);
  if (res.status !== 200) throw new Error("Unable to fetch project");
  return res.data;
};

// Delete a RAG project
export const deleteRagProject = async (id: string) => {
  const res = await axios.delete(`/rag/project/${id}`);
  if (res.status !== 200) throw new Error("Unable to delete RAG project");
  return res.data;
};


// RAG DOCUMENT UPLOAD
export const uploadRagDocument = async (
  projectId: string,
  file: File,
  onProgress?: (progress: number) => void
) => {
  const form = new FormData();
  form.append("file", file);
  form.append("projectId", projectId);

  const res = await axios.post("/rag/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    },
  });

  if (res.status !== 200) throw new Error("Unable to upload RAG document");
  return res.data;
};

// RAG QUERY
export const ragQuery = async (projectId: string, query: string) => {
  const res = await axios.post("/rag/query", { projectId, query });
  if (res.status !== 200) throw new Error("Unable to run RAG query");
  return res.data;
};

// Get documents in a project
export const getRagDocuments = async (projectId: string) => {
  const res = await axios.get(`/rag/project/${projectId}/documents`);
  if (res.status !== 200) throw new Error("Unable to fetch RAG documents");
  return res.data;
};

// Delete a document
export const deleteRagDocument = async (docId: string) => {
  const res = await axios.delete(`/rag/document/${docId}`);
  if (res.status !== 200) throw new Error("Unable to delete document");
  return res.data;
};

// RAG chats
export const createRagChatAPI = async (
  projectId: string,
  workspaceType: "rag" | "gemini" = "rag",
  title?: string
) => {
  const res = await axios.post("/rag/chat/create", {
    projectId,
    workspaceType,
    title
  });

  if (res.status !== 200) throw new Error("Unable to create RAG chat");
  return res.data;
};

export const getProjectRagChats = async (projectId: string) => {
  const res = await axios.get(`/rag/chat/project/${projectId}`);
  if (res.status !== 200) throw new Error("Unable to fetch project chats");
  return res.data;
};

export const getRagChatById = async (chatId: string) => {
  const res = await axios.get(`/rag/chat/${chatId}`);
  if (res.status !== 200) throw new Error("Unable to get chat");
  return res.data;
};

export const sendRagChatMessage = async (payload: {
  chatId?: string;
  projectId: string;
  message: string;
}) => {
  const res = await axios.post("/rag/chat/send", {
    ...payload,
    workspaceType: "rag", 
  });

  if (res.status !== 200) throw new Error("Unable to send chat message");
  return res.data;
};

export const deleteRagChat = async (chatId: string) => {
  const res = await axios.delete(`/rag/chat/${chatId}`);
  if (res.status !== 200) throw new Error("Unable to delete chat");
  return res.data;
};

export async function streamRagMessage(
  chatId: string,
  projectId: string,
  message: string,

  onChunk: (
    data: {
      text?: string;
      done?: boolean;
      citations?: Citation[];
      error?: boolean;
    }
  ) => void
){

  const response =
    await fetch(

      `${import.meta.env.VITE_API_BASE_URL}/rag/chat/stream`,

      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          chatId,
          projectId,
          message,
        }),
      }
    );

  if (!response.body) {
    throw new Error(
      "No response body"
    );
  }

  const reader = response.body.getReader();

  const decoder = new TextDecoder();

  while (true) {
    const {
      done,
      value,
    } = await reader.read();

    if (done) break;

    const chunk =
      decoder.decode(value);

    const lines =
      chunk.split("\n");

    for (const line of lines) {

      if (
        !line.startsWith("data:")
      ) continue;

      const data: {
        text?: string;
        done?: boolean;
        citations?: Citation[];
        error?: boolean;
      } = JSON.parse(
        line.replace(
          "data:",
          ""
        ).trim()
      );

      onChunk(data);
    }
  }
}

export const getDocumentPreviewUrl = async (docId: string) => {
  const res = await axios.get(
    `/rag/document/${docId}/preview`
  );

  return res.data;
};

// GEMINI WORKSPACE CHATS

export const createGeminiChatAPI = async (payload: {
  projectId?: string;
  title?: string;
  chatType?: "standalone" | "project" | "plugged";
  linkedProjectId?: string;
}) => {
  const res = await axios.post("/gemini/chat/create", payload);
  if (res.status !== 200) throw new Error("Failed to create Gemini chat");
  return res.data;
};

export const getGeminiChats = async () => {
  const res = await axios.get("/gemini/chat/all");
  if (res.status !== 200) throw new Error("Failed to fetch Gemini chats");
  return res.data;
};

export const getGeminiChatById = async (chatId: string) => {
  const res = await axios.get(`/gemini/chat/${chatId}`);
  if (res.status !== 200) throw new Error("Failed to fetch Gemini chat");
  return res.data;
};

export const sendGeminiMessage = async (payload: {
  chatId: string;
  message: string;
}) => {
  const res = await axios.post("/gemini/chat/send", payload);
  if (res.status !== 200) throw new Error("Failed to send Gemini message");
  return res.data;
};

export const deleteGeminiChat = async (chatId: string) => {
  const res = await axios.delete(`/gemini/chat/${chatId}`);
  if (res.status !== 200) throw new Error("Failed to delete Gemini chat");
  return res.data;
};

export const createGeminiProject = async (payload: {
  name: string;
  description?: string;
  projectType?: "native" | "plugged";
  linkedRagProjectId?: string;
}) => {
  const res = await axios.post("/gemini/project", payload);
  if (res.status !== 200) throw new Error("Failed to create Gemini project");
  return res.data;
};

export const getGeminiProjects = async () => {
  const res = await axios.get("/gemini/project/all");
  if (res.status !== 200) throw new Error("Failed to fetch Gemini projects");
  return res.data;
};

export const getGeminiProjectById = async (projectId: string) => {
  const res = await axios.get(`/gemini/project/${projectId}`);
  if (res.status !== 200) throw new Error("Failed to fetch Gemini project");
  return res.data;
};

export const deleteGeminiProject = async (projectId: string) => {
  const res = await axios.delete(`/gemini/project/${projectId}`);
  if (res.status !== 200) throw new Error("Failed to delete Gemini project");
  return res.data;
}

export const uploadGeminiFile =
  async (projectId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("projectId", projectId);

    const res = await axios.post(
      "/gemini/upload",
      form,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    if (res.status !== 200) {throw new Error("Gemini upload failed");
  }
  return res.data;
};



export const getGeminiFiles = async (projectId: string) => {
  const res = await axios.get(
    `/gemini/project/${projectId}/files`
  );

  if (res.status !== 200) {
    throw new Error(
      "Failed to fetch Gemini files"
    );
  }
  return res.data;
};

export const deleteGeminiFile = async (fileId: string) => {
  const res = await axios.delete(`/gemini/file/${fileId}`);
  if (res.status !== 200) {
    throw new Error("Failed to delete Gemini file");
  }
  return res.data;
};

export const getGeminiPreviewUrl = async (fileId: string) => {
  const res = await axios.get(`/gemini/file/${fileId}/preview`);
  if (res.status !== 200) {
    throw new Error(
      "Failed to load preview"
    );
  }
  return res.data;
};

export const plugGeminiProjectToRag = async (
  projectId: string
) => {

  const res = await axios.post(`/gemini/project/${projectId}/plug-rag`);
  if (res.status !== 200) {
    throw new Error("Failed to plug project");
  }
  return res.data;
};

export async function plugRagChatToGemini(
  ragProjectId: string,
  ragChatId: string
) {
  const res = await axios.post(`/gemini/project/plug-rag-chat`, {
      ragProjectId,
      ragChatId,
    }
  );

  return res.data;
}

// export async function streamGeminiMessage(
//   chatId: string,
//   message: string,
//   onChunk: (
//     chunk: string
//   ) => void
// ) {
//   const response = await axios.post(`/gemini/chat/stream`, {
//         chatId,
//         message,
//       }, {
//         headers: {
//           "Content-Type":
//             "application/json",
//         },
//         responseType: "stream",
//       }
//     );

//   if (!response.data) {throw new Error("No response data");
//   }
//   const reader = response.data.getReader();

//   const decoder = new TextDecoder();
//   while (true) {
//     const {
//       done,
//       value,
//     } = await reader.read();

//     if (done) break;
//     const chunk = decoder.decode(value);
//     const lines = chunk.split("\n");

//     for (const line of lines) {
//       if (
//         !line.startsWith("data:")
//       ) continue;

//       const data =
//         line.replace("data:", "")
//           .trim();

//       if (
//         data === "[DONE]"
//       ) return;

//       if (
//         data === "[ERROR]"
//       ) {
//         throw new Error(
//           "Streaming failed"
//         );
//       }

//       onChunk(
//         JSON.parse(data)
//       );
//     }
//   }
// }

export async function
streamGeminiMessage(

  chatId: string,
  message: string,

  onChunk: (
    chunk: string
  ) => void
) {

  const response =
    await fetch(

      `${import.meta.env.VITE_API_BASE_URL}/gemini/chat/stream`,

      {
        method: "POST",

        credentials: "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          chatId,
          message,
        }),
      }
    );

  if (!response.body) {

    throw new Error(
      "No response body"
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  while (true) {

    const {
      done,
      value,
    } = await reader.read();

    if (done) break;

    const chunk =
      decoder.decode(value);

    const lines =
      chunk.split("\n");

    for (const line of lines) {

      if (
        !line.startsWith("data:")
      ) continue;

      const data =
        line.replace("data:", "")
          .trim();

      if (
        data === "[DONE]"
      ) return;

      if (
        data === "[ERROR]"
      ) {

        throw new Error(
          "Streaming failed"
        );
      }

      try {

        onChunk(
          JSON.parse(data)
        );

      } catch (err) {
        console.error(
          "Failed to parse chunk",
          err
        );
      }
    }
  }
}