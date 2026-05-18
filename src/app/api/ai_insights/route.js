"use server";
import { NextResponse } from "next/server";
import getAIInsight from "../../../../AI/analyticalAI";

export async function POST(request) {
  try {
    const body = await request.json();
    const getPrompt = body.prompt;
    const prompt = `Analyze this profile deeply, identify strengths, weaknesses, hidden patterns, growth opportunities, risks, personality traits, and actionable improvement recommendations with precision. based on this ${prompt}`;

    const Insight = async (prompt) => {
      const res = await getAIInsight.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return res.text;
    };

    if (Insight) {
      return NextResponse.json({ response: Insight });
    }
  } catch (error) {
    return NextResponse.json({ response: error });
  }
}
