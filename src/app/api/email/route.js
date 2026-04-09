import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { email, message } = await req.json()

    // ✅ Basic validation
    if (!email || !message) {
      return Response.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    // ✅ Send email to YOU (admin)
    await resend.emails.send({
      from: 'noreply@yourdomain.com', // your verified domain
      to: 'your@email.com',
      subject: 'New Contact Message',
      html: `
        <h3>New message</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    })

    // ✅ Send confirmation to USER
    await resend.emails.send({
      from: 'amitdhangar531@gmail.com',
      to: email,
      subject: 'We received your message',
      html: `<p>Thanks! We'll get back to you soon.</p>`,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}