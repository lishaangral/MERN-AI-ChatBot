import mongoose from "mongoose";

export function getRagCollection() {
  return mongoose.connection.collection("rag_chunks");
}
