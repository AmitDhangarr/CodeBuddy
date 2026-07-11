// app/api/profile/[id]/route.js
import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";
import { cookies } from "next/headers";
import { getPayload } from "../../../../../service/handletoken";

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

export async function GET(request, { params }) {
  try {
    const { id: viewUserId } = await params;

    if (!viewUserId) {
      return NextResponse.json({
        success: false,
        message: "no user id provided",
      });
    }

    const cookie = await cookies();
    const token = cookie.get("token");

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "token not found",
      });
    }

    const payload = await getPayload(token.value);
    const viewerEmail = payload.email;

    // Resolve the viewer's own profile id (needed to compute connection_status)
    const { data: viewerProfile, error: viewerError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", viewerEmail)
      .single();

    if (viewerError || !viewerProfile) {
      return NextResponse.json({
        success: false,
        message: viewerError?.message ?? "could not resolve current user",
      });
    }

    const viewerId = viewerProfile.id;

    const { data: profileInfo, error } = await supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("id", viewUserId)
      .single();

    if (error || !profileInfo) {
      return NextResponse.json({
        success: false,
        message: error?.message ?? "something went wrong while fetching the profile",
      });
    }

    // Derive connection_status between viewer and this profile
    const from = Array.isArray(profileInfo.connections_from) ? profileInfo.connections_from : [];
    const to   = Array.isArray(profileInfo.connections_to)   ? profileInfo.connections_to   : [];

    const outgoing = from.find(c => c.to_user_id === viewerId);
    const incoming = to.find(c => c.from_user_id === viewerId);
    const match = outgoing ?? incoming;

    const connection_status = match?.status === "accepted"
      ? "connected"
      : match?.status === "pending"
        ? "pending"
        : "none";

    return NextResponse.json({
      success: true,
      profile: {
        ...profileInfo,
        connection_status,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}