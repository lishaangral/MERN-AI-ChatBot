import { Request, Response } from "express";
import { RagProject } from "./project.model";

// create new project
export async function createProject(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    // ownerId: optional - attach from req.user if you have auth middleware
    const ownerId = (req as any).user?.id || undefined;

    const proj = await RagProject.create({ name, description, ownerId });
    return res.json({ projectId: proj._id, project: proj });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "create project failed" });
  }
}

// list projects (optionally filter by owner)
export async function listProjects(req: Request, res: Response) {
  try {
    // If using auth, prefer owner filter; otherwise list all
    const ownerId = (req as any).user?.id;
    const filter = ownerId ? { ownerId } : {};
    const projects = await RagProject.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ projects });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "list projects failed" });
  }
}

// delete project (and optionally delete associated chunks)
import { getRagCollection } from "./rag.db";
import { getRagDocumentsCollection } from "./rag.documents.db";
import { Chat } from "./rag.chat.model";

export async function deleteProject(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // 1. Delete project
    await RagProject.findByIdAndDelete(id);

    // 2. Delete chunks
    const chunkCol = getRagCollection();
    await chunkCol.deleteMany({ projectId: id });

    // 3. Delete documents metadata
    const docCol = getRagDocumentsCollection();
    const docs = await docCol.find({ projectId: id }).toArray();

    await docCol.deleteMany({ projectId: id });

    // 4. Delete chats
    await Chat.deleteMany({ projectId: id });

    // 5. OPTIONAL: delete S3 files
    // (we’ll add later if needed)

    return res.json({ success: true });

  } catch (err) {
    console.error("DELETE PROJECT ERROR:", err);
    return res.status(500).json({ error: "delete project failed" });
  }
}

export async function getProjectById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const project = await RagProject.findById(id).lean();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.json({ project });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "get project failed" });
  }
}
