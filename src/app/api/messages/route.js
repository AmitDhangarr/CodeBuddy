import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { validateMessage } from "../../../lib/validation";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const conversation_id = searchParams.get("conversation_id");
  const reader_id = searchParams.get("reader_id");
  const mark_read = searchParams.get("mark_read") === "true";

  if (!conversation_id) {
    return NextResponse.json(
      { error: "conversation_id is required" },
      { status: 400 }
    );
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, sent_at, read")
    .eq("conversation_id", conversation_id)
    .order("sent_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let data = messages ?? [];

  if (mark_read && reader_id) {
    const unreadIds = data
      .filter((m) => !m.read && m.sender_id !== reader_id)
      .map((m) => m.id);

    if (unreadIds.length) {
      const { error: updateError } = await supabase
        .from("messages")
        .update({ read: true })
        .in("id", unreadIds);

      if (!updateError) {
        data = data.map((m) =>
          unreadIds.includes(m.id) ? { ...m, read: true } : m
        );
      }
    }
  }

  return NextResponse.json({ data });
}

export async function POST(request) {
  const body = await request.json();
  const { conversation_id, sender_id, content } = body;

  if (!conversation_id || !sender_id) {
    return NextResponse.json(
      { error: "conversation_id and sender_id are required" },
      { status: 400 }
    );
  }

  const contentErr = validateMessage(content);
  if (contentErr) {
    return NextResponse.json({ error: contentErr }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id,
      sender_id,
      content: content.trim().slice(0, 2000),
      read: false,
    })
    .select("id, conversation_id, sender_id, content, sent_at, read")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
