import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";
import { validateMessage } from "../../../../lib/validation";

const SELECT_FIELDS =
  "id, conversation_id, sender_id, content, media_url, message_type, attachments, reply_to, edited, deleted, reaction, sent_at, read";

export async function PATCH(request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Message id is required" }, { status: 400 });
  }

  const body = await request.json();
  const updates = {};

  if (body.read !== undefined) {
    updates.read = !!body.read;
  }

  if (body.content !== undefined) {
    const contentErr = validateMessage(body.content);
    if (contentErr) {
      return NextResponse.json({ error: contentErr }, { status: 400 });
    }
    updates.content = body.content.trim().slice(0, 2000);
    updates.edited = true;
  }

  if (body.deleted === true) {
    updates.deleted = true;
    updates.content = "";
    updates.attachments = [];
    updates.media_url = null;
  }

  if (body.reaction !== undefined) {
    updates.reaction = body.reaction;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided to update" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("messages")
    .update(updates)
    .eq("id", id)
    .select(SELECT_FIELDS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}