import express from 'express';
import { config } from 'dotenv';
import morgan from 'morgan';
import appRouter from './routes/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
config();
const app = express();
// GET - get some data
// PUT - update some data
// POST - create some data
// DELETE - delete some data
// middleware to parse JSON bodies
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
// remove it during production
app.use(morgan("dev"));
app.use("/api/v1", appRouter);
export default app;
