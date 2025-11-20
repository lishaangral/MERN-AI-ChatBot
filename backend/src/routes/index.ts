import { Router } from "express";
import userRoutes from "./user-routes";
import chatRoutes from "./chat-routes";
import ragRoutes from "../rag/rag.routes";
import ragProjectRoutes from "../rag/project.routes";
import ragChatRoutes from "../rag/rag.chat.routes";

const appRouter = Router();

appRouter.use("/user", userRoutes); //domain/api/v1/user
appRouter.use("/chat", chatRoutes); //domain/api/v1/chat
appRouter.use("/rag", ragRoutes);  //domain/api/v1/rag
appRouter.use("/rag", ragProjectRoutes); //domain/api/v1/rag/project
appRouter.use("/rag", ragChatRoutes); // domain/api/v1/rag/chat
export default appRouter;
