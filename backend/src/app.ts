import express from 'express';
// import morgan from 'morgan';
import appRouter from './routes/index';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// GET - get some data
// PUT - update some data
// POST - create some data
// DELETE - delete some data

const CORS_ORIGIN = process.env.CORS_ORIGIN;
const allowedOrigins = [
  "http://localhost:5173",
  CORS_ORIGIN,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow no-origin (mobile apps, curl) and any env-listed origin
      if (
        !origin ||
        allowedOrigins.some(o => !!o && origin.startsWith(o))
      ) {
        callback(null, true);
      } else {
        console.warn("Blocked CORS origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// always handle preflight requests cleanly
app.options("*", cors());

// middleware to parse JSON bodies
// app.use(cors({origin: CORS_ORIGIN, credentials: true}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
// remove it during production
// app.use(morgan("dev"));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/v1", appRouter);

export default app;
