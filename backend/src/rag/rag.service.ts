import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRagCollection } from "./rag.db";
import { ObjectId } from "mongodb";
import { getRagDocumentsCollection } from "./rag.documents.db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_SECRET!);

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
  chunks: string[];
  source: string;
}) {
  const col = getRagCollection();

  const docs = await Promise.all(
    chunks.map(async (chunk, idx) => {
      const embedding = await embedText(chunk);

      return {
        _id: new ObjectId(),
        projectId,
        docId,
        chunk,
        embedding,
        metadata: {
          index: idx,
          source,
        },
      };
    })
  );

  await col.insertMany(docs);

  const docCol = getRagDocumentsCollection();

  await docCol.insertOne({
    _id: new ObjectId(),
    projectId,
    docId,
    filename: source,
    chunkCount: chunks.length,
    uploadedAt: new Date(),
  });
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

export async function retryGenerate(model: any, prompt: string, retries = 3) {
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
