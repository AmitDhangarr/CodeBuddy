import { NextResponse } from "next/server";
import { render } from "@react-email/components";
import JobApplicationEmail from "../../../components/email_templates/job_application";
import { supabase } from "../../../lib/supabaseClient";
import { sendEmailAction } from "../../actions/email";

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { fullname, email, phone, link, cover_letter, role } = body || {};

    // Basic validation
    if (!fullname || typeof fullname !== "string" || !fullname.trim()) {
      return NextResponse.json(
        { success: false, error: "Full name is required" },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email is required" },
        { status: 400 },
      );
    }
    if (!role || typeof role !== "string" || !role.trim()) {
      return NextResponse.json(
        { success: false, error: "Role is required" },
        { status: 400 },
      );
    }
    if (
      cover_letter &&
      typeof cover_letter === "string" &&
      cover_letter.length > 10000
    ) {
      return NextResponse.json(
        { success: false, error: "Cover letter is too long" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("job_application")
      .insert({
        fullname: fullname.trim(),
        email: email.trim(),
        phone: phone || null,
        link: link || null,
        cover_letter: cover_letter || null,
        role: role.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    const applicationDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });

    const applicationId = `APP-${data.id.toString().slice(0, 8)}`;
    const statusUrl = `https://codebuddy.amitdhangar.in/jobs/applications/${data.id}`;

    let emailSent = true;

    try {
      const job_application_template = await render(
        JobApplicationEmail({
          applicantName: fullname,
          applicantEmail: email,
          jobTitle: role,
          companyName: "CodeBuddy",
          applicationId: applicationId,
          applicationDate: applicationDate,
          statusUrl: statusUrl,
          status: "received",
        }),
      );

      const receiverEmail = String(email);

      await sendEmailAction({
        receiverEmail,
        template: job_application_template,
        subject: `Application ${applicationId} for ${role} — Application Received`,
      });
    } catch (emailError) {
      emailSent = false;
      console.error(
        "Failed to send application confirmation email:",
        emailError,
      );
    }

    return NextResponse.json(
      { success: true, data, emailSent },
      { status: 200 },
    );
  } catch (error) {
    console.error("Job application submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
