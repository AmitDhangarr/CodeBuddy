import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { cookies } from "next/headers";
import { getPayload } from "../../../../service/handletoken";

const PROFILE_FIELDS = `
  id, name, handle, role, bio,
  skills_have, skills_need, looking_for,
  locations ( id, city, state, pincode, remote ),
  projects (
    id, sort_order, name, description,
    github_url, branch, stars, state,
    skills_used, created_at
  ),
  connections_from:connections!connections_from_user_id_fkey ( id, to_user_id, status ),
  connections_to:connections!connections_to_user_id_fkey ( id, from_user_id, status ),
  favourites ( id, target_id, target_type )
`;

export async function GET(request) {
  try {
    const cookie = await cookies();
    const token = cookie.get("token");

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "token not found",
      });
    }

    const payload = await getPayload(token.value);
    const email = payload.email;

    const { data: profileInfo, error } = await supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("email", email)
      .single();
      
    if (error || !profileInfo) {
      return NextResponse.json({
        success: false,
        message: error?.message ?? "something went wrong while fetching the profile",
      });
    }

    return NextResponse.json({
      success: true,
      profile: profileInfo,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}