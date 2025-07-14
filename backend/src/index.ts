import { log } from 'console';
import express from 'express';

const app = express();

// GET - get some data
// PUT - update some data
// POST - create some data
// DELETE - delete some data

// middleware to parse JSON bodies
app.use(express.json());

// connections and listeners
app.listen(5000, () => console.log('Server Open'));
