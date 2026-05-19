"use server";
import { NextResponse } from "next/server";
import { getAIInsight } from "../../../../AI/analyticalAI";

export async function POST(request) {
  try {
    const body = await request.json();
    const getPrompt = body.prompt;
    const prompt = `Analyze this profile deeply, identify strengths, weaknesses, hidden patterns, 
    growth opportunities, risks, personality traits, and actionable improvement recommendations 
    with precision. based on this ${getPrompt} in just 12-15 words  `;

    const res = await getAIInsight.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ response: res.text });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
