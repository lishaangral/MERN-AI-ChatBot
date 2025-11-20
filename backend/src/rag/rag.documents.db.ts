import mongoose from "mongoose";

export function getRagDocumentsCollection() {
  return mongoose.connection.collection("rag_documents");
}
