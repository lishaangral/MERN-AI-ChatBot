import { Router } from "express";
import userRoutes from "./user-routes";
import chatRoutes from "./chat-routes";
import ragRoutes from "../rag/rag.routes";

const appRouter = Router();

appRouter.use("/user", userRoutes); //domain/api/v1/user
appRouter.use("/chat", chatRoutes); //domain/api/v1/chat
appRouter.use("/rag", ragRoutes);  //domain/api/v1/rag

export default appRouter;
