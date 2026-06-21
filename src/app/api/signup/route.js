import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateHandle,
  validateBio,
  validateGithubUrl,
  validatePincode,
} from "../../../lib/validation";

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
      location,
      projects,
    } = body;

    // ── 1. Validate required fields ────────────────────────────
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password, { required: true });
    const nameErr = validateName(name);
    const handleErr = validateHandle(handle);
    const bioErr = validateBio(bio);
    const pinErr = location?.pincode ? validatePincode(location.pincode) : "";
    const githubErr = validateGithubUrl(projects?.[0]?.githubUrl, { required: true });

    const validationError =
      emailErr ||
      passErr ||
      nameErr ||
      handleErr ||
      bioErr ||
      pinErr ||
      (!location?.state ? "Location state is required." : "") ||
      (!projects?.[0]?.name?.trim() ? "At least one project name is required." : "") ||
      githubErr;

    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // ── 2. Sanitize inputs ─────────────────────────────────────
    const cleanHandle   = handle.replace(/^@/, "").toLowerCase().trim();
    const safeProjects  = projects.slice(0, 5);

    // ── 3. Check duplicates ────────────────────────────────────
    const { data: existingUser, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, handle")
      .or(`email.eq.${email},handle.eq.${cleanHandle}`)
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
        { success: false, error: `User already exists with this ${conflictField}.` },
        { status: 409 }
      );
    }

    // ── 4. Hash password ───────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── 5. Insert profile ──────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        email,
        password: hashedPassword,
        name,
        handle: cleanHandle,
        bio,
        role,
        looking_for: lookingFor,
        skills_have: skillsHave,
        skills_need: skillsNeed,
      })
      .select("id")
      .single();

    if (profileError) {
      if (profileError.code === "23505") {
        return NextResponse.json(
          { success: false, error: "User already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: profileError.message },
        { status: 400 }
      );
    }

    const profileId = profile.id;

    // ── 6. Insert location ─────────────────────────────────────
    const { error: locationError } = await supabase
      .from("locations")
      .insert({
        profile_id: profileId,
        state:      location.state,
        city:       location.city   || null,
        pincode:    location.pincode || null,
        remote:     location.remote  ?? false,
      });

    if (locationError) {
      // Profile was created — clean it up so we don't leave orphaned data
      await supabase.from("profiles").delete().eq("id", profileId);
      return NextResponse.json(
        { success: false, error: "Failed to save location. Please try again." },
        { status: 400 }
      );
    }

    // ── 7. Insert projects ─────────────────────────────────────
    const projectRows = safeProjects.map((project, i) => ({
      profile_id:  profileId,
      sort_order:  i,
      name:        project.name,
      description: project.description || null,
      github_url:  project.githubUrl,
      branch:      project.branch      || "main",
      stars:       parseInt(project.stars) || 0,
      state:       project.state        || "Active",
      skills_used: project.skills       || [],
    }));

    const { error: projectsError } = await supabase
      .from("projects")
      .insert(projectRows);

    if (projectsError) {
      // Clean up profile + location
      await supabase.from("profiles").delete().eq("id", profileId);
      return NextResponse.json(
        { success: false, error: "Failed to save projects. Please try again." },
        { status: 400 }
      );
    }

    // ── 8. All good ────────────────────────────────────────────
    return NextResponse.json(
      { success: true, message: "Account created successfully.", profileId },
      { status: 201 }
    );

  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}