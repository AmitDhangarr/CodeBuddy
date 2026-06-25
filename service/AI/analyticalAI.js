import { GoogleGenAI } from "@google/genai";
export const getAIInsight = new GoogleGenAI({ apiKey: process.env.API_KEY });


