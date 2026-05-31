import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient.js";
import { cookies } from "next/headers.js";
import { getPayload } from "../../../../service/handletoken.js";

export async function POST(request) {
  try {
    const cookie = await cookies();
    const token = cookie.get("token");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await getPayload(token.value);
    const user = await request.json();

    if (!user)
      return NextResponse.json({ error: "user is not found" }, { status: 400 });

    const { data: me, error: meError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", payload.email)
      .single();

    if (meError || !me)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: existing } = await supabase
      .from("connections")
      .select("id, status")
      .or(
        `and(from_user_id.eq.${me.id},to_user_id.eq.${user.id}),and(from_user_id.eq.${user.id},to_user_id.eq.${me.id})`,
      )
      .single();

    if (existing) {
      await supabase.from("connections").delete().eq("id", existing.id);
      return NextResponse.json({ action: "removed" });
    }

    const { data, error } = await supabase.from("connections").insert({
      name: user.name,
      handle: user.handle,
      role: user.role,
      bio: user.bio,
      skills_have: user.skills_have,
      skills_need: user.skills_need,
      looking_for: user.looking_for,
      location: user.location,
      from_user_id: me.id,
      match_score: user.matchScore,
      to_user_id: user.id,
      status: "pending",
    });

    return NextResponse.json({ action: "added" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
