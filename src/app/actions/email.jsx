"use server";

import { resend } from "../../../service/email/resend_service";

export const sendEmailAction = async (receiverEmail, template, subject) => {
  try {
    const { data, error } = await resend.emails.send({
      from:"CodeBuddy <codebuddy@amitdhangar.in>",
      to: receiverEmail,
      subject:subject,
      html: template,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Something went wrong:", error);
    return { success: false, error: error.message };
  }
};