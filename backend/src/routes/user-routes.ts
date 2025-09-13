import { Router } from "express";
import { getAllUsers, userLogin, userSignup, userLogout, verifyUser } from "../controllers/user-controllers";
import { validate, signupValidator, loginValidator } from "../utils/validators";
import { verifyToken } from "../utils/token-manager";

const userRoutes = Router();

userRoutes.get("/", getAllUsers); 
userRoutes.post("/signup", validate(signupValidator), userSignup);
userRoutes.post("/login", validate(loginValidator), userLogin);
userRoutes.post("/auth-status", verifyToken, verifyUser);
userRoutes.get("/logout", verifyToken, userLogout);

export default userRoutes;