const { NextResponse } = require("next/server");
import { supabase } from "./../../../lib/supabaseClient";

const VULN_TYPES = [
  "Authentication / Authorization",
  "Data Exposure / PII Leak",
  "Injection (SQL, XSS, etc.)",
  "Broken Access Control",
  "Other",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const type = typeof body?.type === "string" ? body.type.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  // Server-side validation (never trust the client)
  if (!VULN_TYPES.includes(type)) {
    return NextResponse.json(
      { success: false, error: "Please select a valid vulnerability type." },
      { status: 400 }
    );
  }
  if (description.length < 20) {
    return NextResponse.json(
      {
        success: false,
        error: "Description must be at least 20 characters long.",
      },
      { status: 400 }
    );
  }
  if (description.length > 5000) {
    return NextResponse.json(
      { success: false, error: "Description is too long (max 5000 characters)." },
      { status: 400 }
    );
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { success: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("security_vulnerabilities")
      .insert({
        type,
        description,
        email: email || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to save your report. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error submitting vulnerability report:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong on our end. Please try again or email us directly.",
      },
      { status: 500 }
    );
  }
}