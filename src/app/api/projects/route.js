export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    let query = supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (profileId) {
      query = query.eq("profile_id", profileId);
    }

    const { data: projects, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, projects: projects || [] },
      { status: 200 }
    );
  } catch (err) {
    console.error("Projects fetch error:", err);
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}