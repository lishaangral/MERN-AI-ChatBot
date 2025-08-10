import axios from "axios";
axios.defaults.withCredentials = true;

export const loginUser = async (email: string, password: string) => {
    const res = await axios.post("/user/login", {email, password}, {withCredentials: true});
    
    if (res.status !== 200) {
        throw new Error("Unable to Login");
    }
    // const data = await res.data;
    return res.data;
};

export const checkAuthStatus = async () => {
    const res = await axios.post("/user/auth-status", {}, {withCredentials: true});
    
    if (res.status !== 200) {
        throw new Error("Unable to Authenticate");
    }
    
    return res.data;
};

export const sendChatRequest = async (message: string) => {
    const res = await axios.post("/chat/new", {message});
    
    if (res.status !== 200) {
        throw new Error("Unable to send chat");
    }
    
    return res.data;
}; 

