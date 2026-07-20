import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { validateGithubUrl } from "../../../lib/validation";

const MAX_PROJECTS = 5;

export async function POST(request) {
  const body = await request.json();

  try {
    const { profileId, name, description, github_url, branch, state, skills_used, stars } = body;
    
    if (!profileId) {
      return NextResponse.json({ success: false, error: "profileId is required." }, { status: 400 });
    }
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Project name is required." }, { status: 400 });
    }
    if (!github_url && !validateGithubUrl(github_url)) {
      return NextResponse.json({ success: false, error: "A valid GitHub URL is required." }, { status: 400 });
    }
    if (skills_used !== undefined && !Array.isArray(skills_used)) {
      return NextResponse.json({ success: false, error: "skills_used must be an array." }, { status: 400 });
    }

    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles").select("id").eq("id", profileId).maybeSingle();

    if (profileFetchError) {
      return NextResponse.json({ success: false, error: profileFetchError.message }, { status: 400 });
    }
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found." }, { status: 404 });
    }

    const { count, error: countError } = await supabase
      .from("projects").select("id", { count: "exact", head: true }).eq("profile_id", profileId);

    if (countError) {
      return NextResponse.json({ success: false, error: countError.message }, { status: 400 });
    }
    if ((count ?? 0) >= MAX_PROJECTS) {
      return NextResponse.json({ success: false, error: `You can add up to ${MAX_PROJECTS} projects.` }, { status: 400 });
    }

    const { data: insertedProject, error: insertError } = await supabase
      .from("projects")
      .insert({
        profile_id:  profileId,
        sort_order:  count ?? 0,
        name:        name.trim(),
        description: description || null,
        github_url:  github_url,
        branch:      branch || "main",
        stars:       parseInt(stars) || 0,
        state:       state || "Active",
        skills_used: skills_used || [],
      })
      .select()
      .single();
    
     console.log(insertError)

    if (insertError) {
      return NextResponse.json({ success: false, error: "Failed to save project. Please try again." }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: "Project saved successfully.", project: insertedProject },
      { status: 201 }
    );
  } catch (err) {
    console.error("Project save error:", err);
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}