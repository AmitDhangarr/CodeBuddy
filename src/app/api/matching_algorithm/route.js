import { NextResponse } from "next/server";
import { calculateMatchScore } from "../../dashboard/shared.js";

export async function POST(request) {
  try {
    const data = await request.json();
    const profiles = await data.json().profiles;

    const profileswithMatchingScore = profiles.map((profile) => ({
      ...profile,
      matchScore: calculateMatchScore(me, profile),
    }));
    
    console.log(profileswithMatchingScore);
    
    return NextResponse.json({ profiles: profileswithMatchingScore });
  } catch (error) {
    return NextResponse.json({ error: error });
  }
}
