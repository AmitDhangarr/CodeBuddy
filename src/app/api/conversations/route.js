import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabaseClient";
import { getPayload } from "../../../../service/handletoken";

const PARTNER_FIELDS =
  "id, name, handle, role, bio, skills_have, skills_need, looking_for";

function conversationPairFilter(userA, userB) {
  return `and(user_a_id.eq.${userA},user_b_id.eq.${userB}),and(user_a_id.eq.${userB},user_b_id.eq.${userA})`;
}

async function getAuthedUserId() {
  const cookie = await cookies();
  const token = cookie.get("token");
  if (!token) return null;

  const payload = await getPayload(token.value);
  const { data: me } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", payload.email)
    .single();

  return me?.id ?? null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let user_id = searchParams.get("user_id");

  if (!user_id) {
    user_id = await getAuthedUserId();
  }

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const { data: convos, error } = await supabase
    .from("conversations")
    .select("id, user_a_id, user_b_id, created_at")
    .or(`user_a_id.eq.${user_id},user_b_id.eq.${user_id}`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!convos?.length) {
    return NextResponse.json({ data: [] });
  }

  const partnerIds = convos.map((c) =>
    c.user_a_id === user_id ? c.user_b_id : c.user_a_id
  );
  const convoIds = convos.map((c) => c.id);

  const [{ data: partners }, { data: allMessages }] = await Promise.all([
    supabase.from("profiles").select(PARTNER_FIELDS).in("id", partnerIds),
    supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, sent_at, read")
      .in("conversation_id", convoIds)
      .order("sent_at", { ascending: false }),
  ]);

  const partnerMap = Object.fromEntries((partners ?? []).map((p) => [p.id, p]));

  const lastByConvo = {};
  for (const msg of allMessages ?? []) {
    if (!lastByConvo[msg.conversation_id]) {
      lastByConvo[msg.conversation_id] = msg;
    }
  }

  const data = convos
    .map((c) => {
      const partnerId =
        c.user_a_id === user_id ? c.user_b_id : c.user_a_id;
      return {
        id: c.id,
        partner: partnerMap[partnerId] ?? { id: partnerId },
        lastMessage: lastByConvo[c.id] ?? null,
      };
    })
    .sort((a, b) => {
      const ta = a.lastMessage?.sent_at ?? a.id;
      const tb = b.lastMessage?.sent_at ?? b.id;
      return String(tb).localeCompare(String(ta));
    });

  return NextResponse.json({ data });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const user_b_id = body.user_b_id ?? body.partner_id;
    const user_a_id = body.user_a_id ?? (await getAuthedUserId());

    if (!user_a_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user_b_id) {
      return NextResponse.json(
        { error: "user_b_id is required" },
        { status: 400 }
      );
    }

  if (user_a_id === user_b_id) {
    return NextResponse.json(
      { error: "Cannot create a conversation with yourself" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(conversationPairFilter(user_a_id, user_b_id))
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ data: existing });
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_a_id, user_b_id })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
