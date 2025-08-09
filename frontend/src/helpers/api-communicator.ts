import axios from "axios";

export const loginUser = async (email: string, password: string) => {
    const res = await axios.post("/user/login", {email, password});
    
    if (res.status !== 201) {
        throw new Error("Unable to Login");
    }
    const data = await res.data;
    return data;
};