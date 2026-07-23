import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET(request, { params }) {
  try {
    const payload = await params;

    if (!payload.id) {
      return NextResponse.json({ success: false, error: "Project id is required." }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", payload.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, project }, { status: 200 });
  } catch (err) {
    console.error("Project fetch error:", err);
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}