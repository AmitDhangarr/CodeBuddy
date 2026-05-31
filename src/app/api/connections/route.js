import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient.js";
export async function GET() {
  try {
    const { data, error } = await supabase.from("connections").select("*");
    if (error) {
      return NextResponse.json({ success: true, error: error });
    }
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
