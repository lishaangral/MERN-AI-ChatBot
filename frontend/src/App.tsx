import './App.css'
import Header from './components/Header'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
// import { useAuth } from './components/context/AuthContext'
function App() {
  // console.log(useAuth()?.isLoggedIn)
  return (
    <>
      <Header></Header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
