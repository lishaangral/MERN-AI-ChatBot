import { Router } from "express";
import { getAllUsers } from "../controllers/user-controllers.js";

const uuserRoutes = Router();

uuserRoutes.get("/", getAllUsers); 

export default uuserRoutes;