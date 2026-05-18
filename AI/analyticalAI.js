"use server";

import { GoogleGenAI } from "@google/genai";

const getAIInsight = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default getAIInsight;
