import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";
import {
  validateName,
  validateHandle,
  validateBio,
} from "../../../../lib/validation.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail } = await getUser();
    const { fullName, handle, bio, github, lookingFor } = body;

    const nameErr = validateName(fullName);
    const handleErr = validateHandle(handle);
    const bioErr = validateBio(bio);

    if (nameErr || handleErr || bioErr) {
      return NextResponse.json(
        { success: false, message: nameErr || handleErr || bioErr },
        { status: 400 }
      );
    }

    const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();

    const { data: existingHandle } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", cleanHandle)
      .neq("email", userEmail)
      .maybeSingle();

    if (existingHandle) {
      return NextResponse.json(
        { success: false, message: "This username is already taken." },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: fullName.trim(),
        handle: cleanHandle,
        bio: bio?.trim() ?? "",
        github: github?.trim() ?? "",
        looking_for: lookingFor,
      })
      .eq("email", userEmail);

    if (error) {
      return NextResponse.json(
        { success: false, message: "Error while updating the profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Try again later." },
      { status: 500 }
    );
  }
}
