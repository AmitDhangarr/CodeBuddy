import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { validateGithubUrl } from "../../../lib/validation";

const MAX_PROJECTS = 5;

function validateProject(project, index) {
  if (!project || typeof project !== "object") {
    return `Project ${index + 1} is invalid.`;
  }

  if (!project.name || typeof project.name !== "string" || !project.name.trim()) {
    return `Project ${index + 1} is missing a name.`;
  }

  if (!project.githubUrl || !validateGithubUrl(project.githubUrl)) {
    return `Project ${index + 1} has an invalid GitHub URL.`;
  }

  if (project.stars !== undefined && isNaN(parseInt(project.stars))) {
    return `Project ${index + 1} has an invalid stars value.`;
  }

  if (project.skills !== undefined && !Array.isArray(project.skills)) {
    return `Project ${index + 1} skills must be an array.`;
  }

  return null;
}

export async function POST(request) {
  const body = await request.json();

  try {
    const { profileId, projects } = body;

    // ── 1. Validate required fields ────────────────────────────
    if (!profileId) {
      return NextResponse.json(
        { success: false, error: "profileId is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one project is required." },
        { status: 400 }
      );
    }

    const safeProjects = projects.slice(0, MAX_PROJECTS);

    for (let i = 0; i < safeProjects.length; i++) {
      const validationError = validateProject(safeProjects[i], i);
      if (validationError) {
        return NextResponse.json(
          { success: false, error: validationError },
          { status: 400 }
        );
      }
    }

    // ── 2. Confirm the profile exists ──────────────────────────
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", profileId)
      .maybeSingle();

    if (profileFetchError) {
      return NextResponse.json(
        { success: false, error: profileFetchError.message },
        { status: 400 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found." },
        { status: 404 }
      );
    }

    // ── 3. Replace existing projects for this profile ─────────
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("profile_id", profileId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: "Failed to update projects. Please try again." },
        { status: 400 }
      );
    }

    // ── 4. Insert new projects ─────────────────────────────────
    const projectRows = safeProjects.map((project, i) => ({
      profile_id:  profileId,
      sort_order:  i,
      name:        project.name.trim(),
      description: project.description || null,
      github_url:  project.githubUrl,
      branch:      project.branch || "main",
      stars:       parseInt(project.stars) || 0,
      state:       project.state || "Active",
      skills_used: project.skills || [],
    }));

    const { data: insertedProjects, error: projectsError } = await supabase
      .from("projects")
      .insert(projectRows)
      .select();

    if (projectsError) {
      return NextResponse.json(
        { success: false, error: "Failed to save projects. Please try again." },
        { status: 400 }
      );
    }

    // ── 5. All good ─────────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        message: "Projects saved successfully.",
        projects: insertedProjects,
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("Projects save error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}