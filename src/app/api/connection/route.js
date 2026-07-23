import { NextResponse } from "next/server";
import { render } from "@react-email/components";
import { supabase } from "../../../lib/supabaseClient";
import getUser from "../../../utils/getuser";
import { sendEmailAction } from "../../actions/email";
import ConnectionRequestEmail from "../../../components/email_templates/connection_request";

export async function POST(request) {
  const auth = await getUser();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }
  const user = auth.user;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const { receiverId } = body || {};

  if (!receiverId || typeof receiverId !== "string") {
    return NextResponse.json({ success: false, error: "receiverId is required." }, { status: 400 });
  }
  if (receiverId === user.id) {
    return NextResponse.json({ success: false, error: "You cannot connect with yourself." }, { status: 400 });
  }

  const { data: existing, error: findErr } = await supabase
    .from("connections")
    .select("*")
    .or(
      `and(from_user_id.eq.${user.id},to_user_id.eq.${receiverId}),and(from_user_id.eq.${receiverId},to_user_id.eq.${user.id})`
    )
    .maybeSingle();

  if (findErr) {
    return NextResponse.json({ success: false, error: findErr.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ success: false, error: "Connection already exists." }, { status: 409 });
  }

  const { data: created, error: insertErr } = await supabase
    .from("connections")
    .insert({ from_user_id: user.id, to_user_id: receiverId, status: "pending" })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
  }

  let emailSent = true;
  try {
    const { data: recipientProfile, error: recipientErr } = await supabase
      .from("profiles")
      .select("id, email, name")
      .eq("id", receiverId)
      .single();

    const { data: senderProfile, error: senderErr } = await supabase
      .from("profiles")
      .select("id, name, role, bio, avatar_url, handle")
      .eq("id", user.id)
      .single();

    if (recipientErr || senderErr || !recipientProfile?.email) {
      throw new Error(recipientErr?.message || senderErr?.message || "Missing recipient email");
    }

    const connectionEmailTemplate = await render(
      ConnectionRequestEmail({
        recipientName: recipientProfile.name || "there",
        senderName: senderProfile.name || "A CodeBuddy user",
        senderRole: senderProfile.role || "",
        senderBio: senderProfile.bio || "",
        senderAvatarUrl: senderProfile.avatar_url || undefined,
        acceptUrl: `https://codebuddy.amitdhangar.in/connections/accept?token=${created.id}`,
        declineUrl: `https://codebuddy.amitdhangar.in/connections/decline?token=${created.id}`,
        senderProfileUrl: senderProfile.handle
          ? `https://codebuddy.amitdhangar.in/profile/${senderProfile.handle}`
          : `https://codebuddy.amitdhangar.in/profile/${senderProfile.id}`,
      })
    );

    const receiverEmail = String(recipientProfile.email);

    await sendEmailAction({
      receiverEmail,
      template: connectionEmailTemplate,
      subject: `${senderProfile.name || "Someone"} wants to connect with you on CodeBuddy`,
    });
  } catch (emailError) {
    emailSent = false;
    console.error("Failed to send connection request email:", emailError);
  }

  return NextResponse.json({ success: true, data: created, emailSent });
}