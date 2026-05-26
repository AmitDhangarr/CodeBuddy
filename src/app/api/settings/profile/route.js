const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";

export async function POST(request) {
  try {
    const { fullName, username, bio, location, github, lookingFor } =
      await request.json();
    const { userEmail } = await getUser();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        fullName: fullName,
        username: username,
        bio: bio,
        location: location,
        github: github,
        lookingFor: lookingFor,
      })
      .eq("email", userEmail)
      .single();

    if (!data) {
      return NextResponse.json({
        success: false,
        message: "encounter a error while updating the profile",
      });

      return NextResponse.json({
        succes: true,
        message: "account has been updated successfully!",
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "something went wrong , try again later",
    });
  }
}
