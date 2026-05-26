import { Request, Response } from "express";
import { GeminiProject } from "./gemini.project.model";
import { plugProjectToRag } from "./gemini.plug.service";
import { GeminiFile } from "./gemini.file.model";
import { Chat } from "../rag/rag.chat.model";
import { deleteFromS3 } from "../utils/s3";
import { plugRagChatToGemini } from "./gemini.rag.plug.service";

// CREATE PROJECT
export async function createGeminiProject(
  req: Request,
  res: Response
) {

  try {

    const {
      name,
      description,
      projectType,
      pluggedRagProjectId,
    } = req.body;

    if (!name) return res.status(400).json({ error: "name required" });

    const project =
      await GeminiProject.create({
        name,
        description,
        projectType,
        pluggedRagProjectId,
      });

    return res.json({
      project,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Failed to create Gemini project",
    });
  }
}



// LIST PROJECTS
export async function listGeminiProjects(
  req: Request,
  res: Response
) {

  try {

    const projects =
      await GeminiProject.find()
      .sort({
        updatedAt: -1,
      })
      .lean();

    return res.json({
      projects,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Failed to fetch Gemini projects",
    });
  }
}



// GET PROJECT
export async function getGeminiProject(
  req: Request,
  res: Response
) {

  try {

    const { projectId } = req.params;

    const project =
      await GeminiProject.findById(
        projectId
      ).lean();

    const files = await GeminiFile.find({
      projectId: project?._id.toString(),
    });

    const allFilesEmbedded =
      files.length > 0 &&
      files.every(f => f.isReferencedByRag);

    return res.json({
      project,
      allFilesEmbedded,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Failed to fetch Gemini Project",
    });
  }
}

// export async function deleteGeminiProject(
//   req: Request,
//   res: Response
// ) {
//     try {
//         const { projectId } = req.params;
//         const project = await GeminiProject.findByIdAndDelete(projectId);
//         return res.json({
//             project,
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({
//             error: "Failed to delete project",
//         });
//     }
// }

export async function deleteGeminiProject(
  req: Request,
  res: Response
) {

  try {

    const { projectId } = req.params;

    const project =
      await GeminiProject.findById(projectId);

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const files =
      await GeminiFile.find({
        projectId,
      });

    // DELETE ONLY NON-RAG FILES FROM S3

    for (const file of files) {

      if (
        file.fileUrl &&
        !file.isReferencedByRag
      ) {
        await deleteFromS3(
          file.fileUrl
        );
      }
    }

    // DELETE GEMINI FILE REFERENCES

    await GeminiFile.deleteMany({
      projectId,
    });

    // DELETE GEMINI CHATS

    await Chat.deleteMany({
      projectId,
    });

    // DELETE GEMINI PROJECT

    await GeminiProject.findByIdAndDelete(
      projectId
    );

    return res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error:
        "Failed to delete project",
    });
  }
}

export async function plugToRag(
  req: Request,
  res: Response
) {
  try {
    const { projectId } = req.params;
    const result = await plugProjectToRag(projectId);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Failed to plug project",
    });
  }
}

export async function plugRagChat(
  req: Request,
  res: Response
) {

  try {
    const {
      ragProjectId,
      ragChatId,
    } = req.body;

    const result = await plugRagChatToGemini(

        ragProjectId,
        ragChatId
      );

    return res.json(result);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error:
        "Failed to plug chat",
    });
  }
}