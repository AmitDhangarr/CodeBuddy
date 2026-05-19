import { NextResponse } from "next/server";
import { calculateMatchScore } from "../dashboard/shared.js";

export async function POST(request) {
  try {
    const data = await request.json();
    const profiles = await data.json().profiles;

    const profileswithMatchingScore = profiles.map((profile) => ({
      ...profile,
      matchScore: calculateMatchScore(me, profile),
    })).filter((profile)=> profile.matchScore >=  0).sort((a,b)=>
     b.matchScore - a.matchScore)
    }
  } catch (error) {}
}
