import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRagCollection } from "./rag.db";
import { ObjectId } from "mongodb";
import { getRagDocumentsCollection } from "./rag.documents.db";
import { ChunkWithPage } from "./chunking";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_SECRET!);

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

// EMBEDDING
export async function embedText(text: string): Promise<number[]> {
  const modelName = process.env.GEMINI_EMBED_MODEL || "text-embedding-004";
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.embedContent(text);
  return result.embedding.values;
}

// STORE CHUNKS
export async function storeChunks({
  projectId,
  docId,
  chunks,
  source,
}: {
  projectId: string;
  docId: string;
  chunks: ChunkWithPage[];
  source: string;
}) {
  const col = getRagCollection();

  const docs = await Promise.all(
    chunks.map(async (item, idx) => {
      const embedding = await embedText(item.chunk);

      return {
        _id: new ObjectId(),
        projectId,
        docId,
        chunk: item.chunk,
        embedding,
        metadata: {
          index: idx,
          source,
          pageNumber: item.pageNumber,
          preview: item.chunk.slice(0, 200),
        },
      };
    })
  );

  await col.insertMany(docs);
}

// VECTOR SEARCH
export async function searchRelevantChunks(projectId: string, query: string) {
  const col = getRagCollection();

  const queryVector = await embedText(query);

  const results = await col
    .aggregate([
      {
        $vectorSearch: {
          index: "rag_vector_index",
          path: "embedding",
          queryVector,
          numCandidates: 100,
          limit: 5,
          filter: { projectId },
        },
      },
    ])
    .toArray();

  return results; // full docs returned
}

// GENERATE FINAL ANSWER
export async function generateAnswerFromChunks(
  chunks: string[],
  query: string
): Promise<string> {
  const modelName = process.env.GEMINI_GENERATE_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const context = chunks.join("\n\n");
  const prompt = `
    You are a scientific RAG assistant.
    Use ONLY the provided context to answer the question.
    If context is insufficient, clearly state that.

    CONTEXT:
    ${context}

    QUESTION:
    ${query}
    `;

  const response = await retryGenerate(model, prompt);
  return response.response.text();
}

export async function retryGenerate(model: any, prompt: string, retries = 1) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await model.generateContent(prompt);
      return res;
    } catch (err: any) {
      console.error(`Gemini attempt ${attempt} failed`, err.message);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1500)); // wait 1.5s
    }
  }
}

export async function storeDocumentMetadata({
  projectId,
  docId,
  filename,
  fileUrl,
  size,
  chunkCount,
  s3Key,
}: any) {
  const col = getRagDocumentsCollection();

  await col.insertOne({
    projectId,
    docId,
    filename,
    fileUrl,
    size,
    chunkCount,
    s3Key: s3Key,
    uploadedAt: new Date(),
  });
}

// export async function streamAnswerFromChunks(
//   chunks: string[],
//   query: string
// ) {

//   const model = genAI.getGenerativeModel({
//       model:
//         process.env
//           .GEMINI_GENERATE_MODEL
//         || "gemini-2.5-flash",
//     });

//   const context = chunks.join("\n\n");

//   const prompt = `
//     You are a scientific RAG assistant.

//     Use ONLY the provided context.

//     If context is insufficient,
//     say so clearly.

//     CONTEXT:
//     ${context}

//     QUESTION:
//     ${query}
//     `;
//   return model.generateContentStream(
//     prompt
//   );
// }

export async function streamAnswerFromChunks(
  chunks: string[],
  query: string
) {

  const model =
    genAI.getGenerativeModel({
      model:
        process.env
          .GEMINI_GENERATE_MODEL
        || "gemini-2.5-flash",
    });

  const context = chunks.join("\n\n");

  const prompt = `
You are a scientific RAG assistant.

Use ONLY the provided context.

If context is insufficient,
say so clearly.

CONTEXT:
${context}

QUESTION:
${query}
`;

  try {

    return await model
      .generateContentStream(
        prompt
      );

  } catch (err: any) {

    console.error(
      "Gemini stream init failed:",
      err.message
    );

    throw err;
  }
}