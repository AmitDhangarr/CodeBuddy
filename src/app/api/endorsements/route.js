import { NextResponse } from "next/server";
import { supabase } from "./../../../lib/supabaseClient";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const endorsedId = searchParams.get("endorsed_id");

    if (!endorsedId) {
      return NextResponse.json({ success: false, message: "endorsed_id not provided" });
    }

    const { data, error } = await supabase
      .from("endorsements")
      .select("*")
      .eq("endorsed_id", endorsedId);


      console.log(data);

    if (error) {
      return NextResponse.json({ success: false, error: error, status: 404 });
    }

    return NextResponse.json({ success: true, data: data, status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message, status: 404 });
  }
}