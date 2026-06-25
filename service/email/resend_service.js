import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmails = async (receiver_email,template,category) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <amitdhangar531@amitdhangar.in>",
      to: receiver_email,
      subject: category.subject,
      html:template,
    });
    if (error) {
      return console.error({ error });
    }
    console.log({ data });
  } catch (error) {
    console.error("Something went wrong:", err);
  }
};
