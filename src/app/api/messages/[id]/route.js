import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function PATCH(request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Message id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("id", id)
    .select("id, conversation_id, sender_id, content, sent_at, read")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
