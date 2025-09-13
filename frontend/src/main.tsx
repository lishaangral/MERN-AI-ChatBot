import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import {Toaster} from 'react-hot-toast';
import axios from "axios";

// use for dev only
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const API_BASE = "https://mern-ai-chatbot-backend-g62a.onrender.com";
axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = import.meta.env.VITE_API_USE_CREDENTIALS === "true" || true;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
      <Toaster position="top-right" />
        <App /> 
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
