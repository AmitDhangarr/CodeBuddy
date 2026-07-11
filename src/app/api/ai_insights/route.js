"use server";
import { NextResponse } from "next/server";
import {getAIInsight} from "../../../../service/AI/analyticalAI.js"
export async function POST(request) {
  try {
    const body = await request.json();
    const getPrompt = body.prompt;
    const prompt = `provide me short insight of one sentence for ${getPrompt}`;

    const res = await getAIInsight.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ response: res?.text });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
