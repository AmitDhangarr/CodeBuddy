import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
export async function GET(req){
  const token = await req.cookies.get("access_token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  const {data,error} = await supabase.auth.getUser(token);
  if(error){
     return new Response("Invalid token", { status: 401 });
  }
  
  return NextResponse.json({user:data.user});
}