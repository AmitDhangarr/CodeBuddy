const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const { endorser_id, endorsed_id, skill, description } = body;
    const { data, error } = await supabase
      .from("endorsements")
      .insert({
        endorese_id: endorser_id,
        endorsed_id: endorsed_id,
        skill: skill,
        description: description,
      })
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error, status: 404 });
    }
    return NextResponse.json({ success: true, data: data, status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error, status: 404 });
  }
}
