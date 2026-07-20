import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabaseClient";
import { getPayload } from "../../../../service/handletoken";

async function getAuthUser() {
  const cookie = await cookies();
  const token = cookie.get("token");
  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  const payload = await getPayload(token.value);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", payload.email)
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Profile not found", status: 404 };
  }

  return { user: data };
}

function shapeRow(row, myId) {
  const direction = row.from_user_id === myId ? "outgoing" : "incoming";
  let status;
  if (row.status === "accepted") status = "connected";
  else if (row.status === "declined") status = "declined";
  else status = direction === "outgoing" ? "sent" : "pending";

  return {
    id: row.id,
    from_user_id: row.from_user_id,
    to_user_id: row.to_user_id,
    direction,
    status,
    db_status: row.status,
    created_at: row.created_at,
    name: row.name,
    handle: row.handle,
    role: row.role,
    looking_for: row.looking_for,
    skills_have: row.skills_have,
    skills_need: row.skills_need,
    match_score: row.match_score,
    location: row.location,
    bio: row.bio,
  };
}

export async function GET(request) {
  const auth = await getAuthUser();
  if (auth.error) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }
  const user = auth.user;

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  let query = supabase
    .from("connections")
    .select("*")
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (statusFilter && ["accepted", "declined", "pending"].includes(statusFilter)) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const shaped = (data || []).map((row) => shapeRow(row, user.id));

  return NextResponse.json({ success: true, data: shaped });
}