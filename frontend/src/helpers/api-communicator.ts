// frontend/src/helpers/api-communicator.ts
import axios from "axios";
axios.defaults.withCredentials = true;

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

export const sendChatRequest = async (message: string, chatId?: string) => {
  // POST /chat/new { message, chatId? }
  const res = await axios.post("/chat/new", { message, chatId });
  if (res.status !== 200) throw new Error("Unable to send chat");
  return res.data;
};

// Chats: create, list, get, delete
export const createChatAPI = async () => {
  const res = await axios.post("/chat/create");
  if (![200,201].includes(res.status)) throw new Error("Unable to create chat");
  return res.data;
};

export const getUserChats = async () => {
  const res = await axios.get("/chat/all-chats");
  if (res.status !== 200) throw new Error("Unable to fetch chats");
  return res.data;
};


export const getChatById = async (chatId: string) => {
  const res = await axios.get(`/chat/${chatId}`);
  if (res.status !== 200) throw new Error("Unable to fetch chat");
  return res.data;
};

export const deleteChatById = async (chatId: string) => {
  const res = await axios.delete(`/chat/${chatId}`);
  if (res.status !== 200) throw new Error("Unable to delete chat");
  return res.data;
};

export const deleteUserChats = async () => {
  const res = await axios.delete("/chat/delete");
  if (res.status !== 200) throw new Error("Unable to delete chats");
  return res.data;
};

export const logoutUser = async () => {
  const res = await axios.get("/user/logout");
  if (res.status !== 200) throw new Error("Unable to logout");
  return res.data;
};
