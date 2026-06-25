const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, description, email } = body;
    const { data, error } = await supabase
      .from("security_vulnerabilities")
      .insert({
        type: type,
        description: description,
        email: email,
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
