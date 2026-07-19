import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient.js";
import { calculateMatchScore } from "../../dashboard/shared.js";
import { cookies } from "next/headers.js";
import { getPayload } from "../../../../service/handletoken.js";

const PROFILE_FIELDS = `
  id, name, handle, role, bio,
  skills_have, skills_need, looking_for,
  locations ( id, city, state ),
  projects ( id, sort_order, stars ),
  connections_from:connections!connections_from_user_id_fkey ( id, to_user_id, status ),
  connections_to:connections!connections_to_user_id_fkey ( id, from_user_id, status ),
  favourites ( id, target_id, target_type )
`;

function normalizeProfile(profile) {
  return {
    ...profile,
    skills_have: Array.isArray(profile.skills_have) ? profile.skills_have : [],
    skills_need: Array.isArray(profile.skills_need) ? profile.skills_need : [],
  };
}

export async function GET(request) {
  try {
    const cookie = await cookies();
    const token = cookie.get("token");
    const payload = await getPayload(token.value);

    const { data: allProfiles, error: allError } = await supabase
      .from("profiles")
      .select(PROFILE_FIELDS);

    if (allError) {
      return NextResponse.json({ error: allError.message }, { status: 500 });
    }

    const { data: meData, error: meError } = await supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("email", payload.email)
      .single();

    if (meError) {
      return NextResponse.json({ error: meError.message }, { status: 500 });
    }

    const me = normalizeProfile(meData);

    const profilesWithMatchScore = allProfiles
      .filter((profile) => profile.id !== me.id)
      .map((profile) => {
        const normalized = normalizeProfile(profile);

        const isFavourited =
          me.favourites?.some(
            (fav) => fav.target_id === profile.id && fav.target_type === "profile"
          ) ?? false;

        const connectionRow =
          profile.connections_from?.find((conn) => conn.to_user_id === me.id) ??
          profile.connections_to?.find((conn) => conn.from_user_id === me.id) ??
          null;

        const connectionStatus = connectionRow?.status ?? null;

        return {
          ...normalized,
          matchScore: calculateMatchScore(me, normalized),
          isFavourited,
          connectionStatus,
          isConnected: connectionStatus === "accepted",
        };
      });

    return NextResponse.json({ profiles: profilesWithMatchScore });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}