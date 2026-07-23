import { NextResponse } from "next/server";
import { render } from "@react-email/components";
import getUser from "../../../utils/getuser";
import { sendEmailAction } from "../../actions/email";
import PlanPurchasedNotification from "../../../components/email_templates/billing_notification";

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

  const { planName, billingCycle, amount, paymentMethod, transactionId, date } = body || {};

  if (!planName || !amount || !paymentMethod || !transactionId) {
    return NextResponse.json({ success: false, error: "Missing purchase details." }, { status: 400 });
  }

  let emailSent = true;
  try {
    if (!user.email) {
      throw new Error("Missing user email");
    }

    const planPurchasedTemplate = await render(
      PlanPurchasedNotification({
        username: user.name || user.email.split("@")[0],
        planName,
        billingCycle: billingCycle || "Monthly",
        amount,
        paymentMethod,
        transactionId,
        date: date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      })
    );

    const receiverEmail = String(user.email);

    await sendEmailAction({
      receiverEmail,
      template: planPurchasedTemplate,
      subject: `Receipt: Your ${planName} subscription — CodeBuddy`,
    });
    
  } catch (emailError) {
    emailSent = false;
    console.error("Failed to send plan purchased email:", emailError);
  }

  return NextResponse.json({ success: true, emailSent });
}