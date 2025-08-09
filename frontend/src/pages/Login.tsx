import React from 'react'
import CustomizedInput from '../components/shared/CustomizedInput'
import { useAuth } from '../components/context/AuthContext';
import {toast} from 'react-hot-toast';

const Login = () => {
  const auth = useAuth();
  
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      toast.loading("Signing In", {id: "login"})
      await auth?.login(email, password);
      toast.success("Signed In Successfully", {id: "login"});
    } catch (error) {
      console.log(error);
      toast.error("Signing In Failed", {id: "login"});
    }
  }

  return (
    <div>
        Login
        <form onSubmit={(e) => handleSubmit(e)}>
            <div>
                <CustomizedInput type="email" name="email" label="Email" />
                <CustomizedInput type="password" name="password" label="Password" />
                <button type="submit">Submit</button>
            </div>
        </form>
    </div>
  )
}

export default Login