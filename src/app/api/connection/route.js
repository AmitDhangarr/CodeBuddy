import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient.js";
import { cookies } from "next/headers.js";
import { getPayload } from "../../../../service/handletoken.js";

export async function POST(request) {
  try {
    const cookie = await cookies();
    const token = cookie.get("token");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await getPayload(token.value);
    const { receiverId } = await request.json();

    if (!receiverId) return NextResponse.json({ error: "receiverId is required" }, { status: 400 });

    const { data: me, error: meError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", payload.email)
      .single();

    if (meError || !me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: existing } = await supabase
      .from("connections")
      .select("id, status")
      .or(`and(from_user_id.eq.${me.id},to_user_id.eq.${receiverId}),and(from_user_id.eq.${receiverId},to_user_id.eq.${me.id})`)
      .single();

    if (existing) {
      await supabase.from("connections").delete().eq("id", existing.id);
      return NextResponse.json({ action: "removed" });
    }

    await supabase.from("connections").insert({ from_user_id: me.id, to_user_id: receiverId, status: "pending" });
    return NextResponse.json({ action: "added" });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}