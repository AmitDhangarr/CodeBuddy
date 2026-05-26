const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";

export async function POST(request) {
  try {
    const { userEmail } = await getUser();
    const {
      newMatchFound,
      connectionRequest,
      messages,
      weeklyDigest,
      profileViews,
    } = await request.json();

    const {data,error} = await supabase.from("notifications",).update({
      newMatchFound:newMatchFound,
      connectionRequest:connectionRequest,
      messages:messages,
      weeklyDigest:weeklyDigest,
      profileViews:profileViews
    }).eq("email",userEmail);

    if(!data){
     return NextResponse.json({
      success:true,
      messages:"ecountered error while updating the Notifications"
     });

     return NextResponse.json({
      success:true,
      message:"notification settings have been saved"
     })
    }
  } catch (error) {
    return NextResponse.json({
      success:false,
      message:"something went wrong please try again later"
     })
  }
}
