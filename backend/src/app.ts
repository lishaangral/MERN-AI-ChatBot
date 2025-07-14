import express from 'express';
import { config } from 'dotenv';

config();
const app = express();

// GET - get some data
// PUT - update some data
// POST - create some data
// DELETE - delete some data

// middleware to parse JSON bodies
app.use(express.json());

export default app;