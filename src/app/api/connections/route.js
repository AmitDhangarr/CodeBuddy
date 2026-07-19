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

export async function POST(request) {
  const auth = await getAuthUser();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }
  const user = auth.user;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const { receiverId, status } = body || {};

  if (!receiverId || typeof receiverId !== "string") {
    return NextResponse.json({ success: false, error: "receiverId is required." }, { status: 400 });
  }
  if (!["accepted", "declined"].includes(status)) {
    return NextResponse.json(
      { success: false, error: "Blocking isn't supported by the current schema — only 'accepted' or 'declined'." },
      { status: 400 }
    );
  }

  const { data: existing, error: findErr } = await supabase
    .from("connections")
    .select("*")
    .or(
      `and(from_user_id.eq.${user.id},to_user_id.eq.${receiverId}),and(from_user_id.eq.${receiverId},to_user_id.eq.${user.id})`
    )
    .maybeSingle();

  if (findErr) {
    return NextResponse.json({ success: false, error: findErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ success: false, error: "Connection not found." }, { status: 404 });
  }

  if (status === "accepted") {
    if (existing.status !== "pending" || existing.to_user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "No pending request to accept." },
        { status: 409 }
      );
    }
  }

  const { data: updated, error: updateErr } = await supabase
    .from("connections")
    .update({ status })
    .eq("id", existing.id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: shapeRow(updated, user.id) });
}