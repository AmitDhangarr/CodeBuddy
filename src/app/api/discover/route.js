import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient.js";

export async function GET(request) {
  try {
    const { data, error } = await supabase.from("profiles").select(
      `id,
       name,
       handle,
       role,
       bio,
       looking_for,
       locations (
         id, city, state
       ),
       projects (
         id, sort_order, stars
       )`,
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
