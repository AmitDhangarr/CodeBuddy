import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
export async function POST(request) {
  const body = await request.json();
  try {
    const {
      email,
      name,
      handle,
      bio,
      role,
      lookingFor,
      skillsHave,
      skillsNeed,
    } = body;
    
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        email,
        name,
        handle,
        bio,
        role,
        looking_for: lookingFor,
        skills_have: skillsHave,
        skills_need: skillsNeed,
      })
      .select();
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
