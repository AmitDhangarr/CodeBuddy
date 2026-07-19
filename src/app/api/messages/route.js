import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { validateMessage } from "../../../lib/validation";

const MESSAGE_TYPES = ["text", "image", "video", "audio"];
const SELECT_FIELDS =
  "id, conversation_id, sender_id, content, media_url, message_type, attachments, reply_to, edited, deleted, reaction, sent_at, read";

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
    .select(SELECT_FIELDS)
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
  const {
    conversation_id,
    sender_id,
    content,
    media_url,
    message_type,
    attachments,
    reply_to,
  } = body;

  if (!conversation_id || !sender_id) {
    return NextResponse.json(
      { error: "conversation_id and sender_id are required" },
      { status: 400 }
    );
  }

  const type = message_type || "text";
  if (!MESSAGE_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `message_type must be one of: ${MESSAGE_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const trimmedContent = content?.trim().slice(0, 2000) || null;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

  if (type === "text" && !trimmedContent && !hasAttachments) {
    return NextResponse.json(
      { error: "Text messages require content or at least one attachment" },
      { status: 400 }
    );
  }
  if (type !== "text" && !media_url) {
    return NextResponse.json(
      { error: `${type} messages require a media_url` },
      { status: 400 }
    );
  }

  if (type === "text") {
    const contentErr = validateMessage(content);
    if (contentErr) {
      return NextResponse.json({ error: contentErr }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id,
      sender_id,
      content: trimmedContent,
      media_url: media_url || null,
      message_type: type,
      attachments: attachments ?? [],
      reply_to: reply_to ?? null,
      read: false,
    })
    .select(SELECT_FIELDS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}