import { Request, Response } from "express";
import { RagProject } from "./project.model";

// create new project
export async function createProject(req: Request, res: Response) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    // ownerId: optional - attach from req.user if you have auth middleware
    const ownerId = (req as any).user?.id || undefined;

    const proj = await RagProject.create({ name, ownerId });
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
import { ObjectId } from "mongodb";
import { getRagCollection } from "./rag.db";

export async function deleteProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "project id required" });

    await RagProject.findByIdAndDelete(id);

    // Also delete chunks associated with this project
    const col = getRagCollection();
    await col.deleteMany({ projectId: id });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "delete project failed" });
  }
}
