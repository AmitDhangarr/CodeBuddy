const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient";

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

    const body = await request.json();
    const { category, receiver_email, message } = body;
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        category: category,
        sender_email: me.email,
        receiver_email: receiver_email,
        message: message,
      })
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error, status: 404 });
    }

    // resend api call

    return NextResponse.json({ success: true, data: data, status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error, status: 404 });
  }
}
