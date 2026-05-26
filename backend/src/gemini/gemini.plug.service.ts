// gemini.plug.service.ts

import { randomUUID } from "crypto";
import { RagProject } from "../rag/project.model";
import { GeminiProject } from "./gemini.project.model";
import { GeminiFile } from "./gemini.file.model";
import { chunkPages } from "../rag/chunking";
import {
  storeChunks,
  storeDocumentMetadata,
} from "../rag/rag.service";

export async function plugProjectToRag(
  geminiProjectId: string
) {

  const geminiProject = await GeminiProject.findById(geminiProjectId);

  if (!geminiProject) {
    throw new Error("Gemini project not found");
  }

  let ragProject;

  // 1. PLUGGED GEMINI PROJECT
  // reconnect to original RAG

  if (
    geminiProject.projectType === "plugged" &&
    geminiProject.sourceRagProjectId
  ) {

    ragProject =
      await RagProject.findById(
        geminiProject.sourceRagProjectId
      );
  }

  // 2. NATIVE GEMINI PROJECT
  // already synced once

  else if (
    geminiProject.pluggedRagProjectId
  ) {

    ragProject =
      await RagProject.findById(
        geminiProject.pluggedRagProjectId
      );
  }

  // 3. FIRST TIME NATIVE GEMINI
  // create new RAG project

  else {

    ragProject =
      await RagProject.create({

        name:
          `${geminiProject.name} (RAG)`,

        description:
          geminiProject.description,

        sourceGeminiProjectId:
          geminiProjectId,
      });

    geminiProject.pluggedRagProjectId =
      ragProject._id.toString();

    await geminiProject.save();
  }

  const files = await GeminiFile.find({
    projectId: geminiProjectId,
    isReferencedByRag: false,
  });

  let embeddedCount = 0;

  for (const file of files) {

    if (!file.extractedPages?.length) {
      continue;
    }

    const chunks =
      chunkPages(file.extractedPages);

    const docId = randomUUID();

    await storeChunks({
      projectId: ragProject!._id.toString(),
      docId,
      chunks,
      source: file.filename,
    });

    await storeDocumentMetadata({
      projectId: ragProject!._id.toString(),
      docId,
      filename: file.filename,
      fileUrl: file.fileUrl,
      size: file.size,
      chunkCount: chunks.length,
    });

    file.ragDocumentId = docId;
    file.isReferencedByRag = true;

    await file.save();

    embeddedCount++;
  }

  return {
    ragProjectId: ragProject!._id.toString(),
    embeddedCount,
    synced: true,
  };
}