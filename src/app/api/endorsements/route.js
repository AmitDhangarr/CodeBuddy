const { NextResponse } = require("next/server");
import { cookies } from "next/headers";
import { supabase } from "./../../../lib/supabaseClient";
import { getPayload } from "../../../../service/handletoken";

export async function GET(request) {
  try {
    const cookie = await cookies();
    const token = cookie.get("token");
    if (!token)
      return NextResponse.json(
        { error: "Unauthorized:token not found" },
        { status: 401 },
      );

    const payload = await getPayload(token.value);
    const user = await request.json();

    if (!user)
      return NextResponse.json({ error: "user is not found" }, { status: 400 });

    const { data: me, error: meError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", payload.email)
      .single();

    if (meError || !me) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("endorments")
      .select("*")
      .eq("endorser_id", me.id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error, status: 404 });
    }
    return NextResponse.json({ success: true, data: data, status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error, status: 404 });
  }
}
