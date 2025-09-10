import { GoogleGenerativeAI } from "@google/generative-ai";
export const configureGemini = () => {
    if (!process.env.GEMINI_SECRET) {
        throw new Error("Missing GEMINI API KEY in environment variables");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_SECRET);
    return genAI;
};
