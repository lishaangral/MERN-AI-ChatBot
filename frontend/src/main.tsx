import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './components/context/AuthContext.tsx'
import {Toaster} from 'react-hot-toast';
import axios from "axios";
axios.defaults.baseURL = "http://localhost:5000/api/v1";
axios.defaults.withCredentials = true;

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
