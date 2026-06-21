import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabaseClient";
import { getPayload } from "../../../../service/handletoken";

const PROFILE_FIELDS =
  "id, name, handle, role, bio, skills_have, skills_need, looking_for, email";

export async function GET() {
  try {
    const cookie = await cookies();
    const token = cookie.get("token");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await getPayload(token.value);

    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("email", payload.email)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
