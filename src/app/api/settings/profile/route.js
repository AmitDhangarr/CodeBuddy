const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient.js";

export async function POST(request) {
  try {
    const { fullName, username, bio, location, github, lookingFor } = await request.json();
     

  } catch (error) {}
}
