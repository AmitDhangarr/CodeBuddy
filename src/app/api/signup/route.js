import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const body = await request.json();

  try {
    const {
      email,
      password,
      name,
      handle,
      bio,
      role,
      lookingFor,
      skillsHave,
      skillsNeed,
    } = body;

    // Check if user already exists by email or handle
    const { data: existingUser, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, handle")
      .or(`email.eq.${email},handle.eq.${handle}`)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 400 }
      );
    }

    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "handle";
      return NextResponse.json(
        {
          success: false,
          error: `User already exists with this ${conflictField}.`,
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        email,
        password: hashedPassword,
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
      // Fallback: catch DB-level unique constraint violations
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, error: "User already exists." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}