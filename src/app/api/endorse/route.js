import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabaseClient";
import { getPayload } from "../../../../service/handletoken";

function hashToHue(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

export async function POST(request) {
  try {
    const cookie = await cookies();
    const token = cookie.get("token");
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await getPayload(token.value);
    if (!payload?.email) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const { data: endorserProfile, error: endorserErr } = await supabase
      .from("profiles")
      .select("id, name, handle")
      .eq("email", payload.email)
      .single();

    if (endorserErr || !endorserProfile) {
      return NextResponse.json(
        { success: false, error: "Endorser profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { to_user_id, project_id, skill, note } = body;

    if (!to_user_id || !skill) {
      return NextResponse.json(
        { success: false, error: "to_user_id and skill are required" },
        { status: 400 }
      );
    }

    if (endorserProfile.id === to_user_id) {
      return NextResponse.json(
        { success: false, error: "You can't endorse yourself" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("endorsements")
      .insert({
        endorser_id: endorserProfile.id,
        endorsed_id: to_user_id,
        project_id,
        skill,
        description: note ?? "",
      })
      .select("id, skill, description, created_at")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const endorsement = {
      id: data.id,
      name: endorserProfile.name ?? "You",
      handle: endorserProfile.handle ?? "you",
      hue: hashToHue(endorserProfile.handle ?? endorserProfile.id),
      skill: data.skill,
      note: data.description ?? "",
    };

    return NextResponse.json({ success: true, endorsement }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}