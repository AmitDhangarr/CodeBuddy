import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

/**
 * AccountCreationEmail Props:
 * @param {string} username         - The new user's display name
 * @param {string} email            - The user's email address
 * @param {string} confirmationUrl  - Email verification / account activation link
 * @param {string} [dashboardUrl]   - Link to the user dashboard (optional)
 */
export default function AccountCreationEmail({
  username = "DevHero",
  email = "dev@example.com",
  confirmationUrl = "https://codebuddy.dev/confirm?token=abc123",
  dashboardUrl = "https://codebuddy.dev/dashboard",
}) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to CodeBuddy, {username}! Confirm your account to get started.</Preview>
      <Body style={main}>
        {/* Header */}
        <Section style={header}>
          <Text style={logo}>⚡ CodeBuddy</Text>
        </Section>

        <Container style={container}>
          {/* Hero */}
          <Section style={heroBand}>
            <Text style={heroEyebrow}>ACCOUNT CREATED</Text>
            <Heading style={heroHeading}>You're in, {username}.</Heading>
            <Text style={heroSub}>
              One click stands between you and your next breakthrough. Confirm your email to activate
              your CodeBuddy account.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={confirmationUrl}>
              ✅ Confirm My Account
            </Button>
            <Text style={ctaNote}>
              Or paste this link into your browser:{" "}
              <Link href={confirmationUrl} style={inlineLink}>
                {confirmationUrl}
              </Link>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Account Details */}
          <Section style={detailsSection}>
            <Text style={detailsTitle}>YOUR ACCOUNT DETAILS</Text>
            <Row style={detailRow}>
              <Column style={detailLabel}>Username</Column>
              <Column style={detailValue}>{username}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Email</Column>
              <Column style={detailValue}>{email}</Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* What's next */}
          <Section style={nextSection}>
            <Text style={detailsTitle}>WHAT'S NEXT?</Text>
            <Text style={nextItem}>🔥 <strong>Explore</strong> — Browse templates, snippets & projects</Text>
            <Text style={nextItem}>🤝 <strong>Connect</strong> — Follow devs who inspire you</Text>
            <Text style={nextItem}>🚀 <strong>Build</strong> — Start your first project today</Text>
            <Button style={secondaryButton} href={dashboardUrl}>
              Go to Dashboard →
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © 2024 CodeBuddy Inc. · All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="https://codebuddy.dev/unsubscribe" style={footerLink}>Unsubscribe</Link>
              {" · "}
              <Link href="https://codebuddy.dev/privacy" style={footerLink}>Privacy Policy</Link>
              {" · "}
              <Link href="https://codebuddy.dev/terms" style={footerLink}>Terms</Link>
            </Text>
            <Text style={footerNote}>
              This email was sent to {email}. If you didn't create a CodeBuddy account, you can
              safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const main = {
  backgroundColor: "#0D0D0D",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

const header = {
  backgroundColor: "#0D0D0D",
  padding: "24px 40px",
  borderBottom: "2px solid #FF4D00",
};

const logo = {
  color: "#FF4D00",
  fontSize: "22px",
  fontWeight: "900",
  letterSpacing: "-0.5px",
  margin: "0",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#141414",
  border: "1px solid #222",
};

const heroBand = {
  backgroundColor: "#FF4D00",
  padding: "48px 40px",
};

const heroEyebrow = {
  color: "#FFD6C4",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "3px",
  textTransform: "uppercase",
  margin: "0 0 12px",
};

const heroHeading = {
  color: "#FFFFFF",
  fontSize: "38px",
  fontWeight: "900",
  lineHeight: "1.1",
  margin: "0 0 16px",
  letterSpacing: "-1px",
};

const heroSub = {
  color: "#FFD6C4",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0",
};

const ctaSection = {
  padding: "40px 40px 24px",
  textAlign: "center",
};

const ctaButton = {
  backgroundColor: "#FF4D00",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "800",
  textDecoration: "none",
  padding: "16px 40px",
  borderRadius: "4px",
  display: "inline-block",
  letterSpacing: "0.5px",
};

const ctaNote = {
  color: "#666",
  fontSize: "12px",
  marginTop: "16px",
  lineHeight: "1.5",
};

const inlineLink = {
  color: "#FF4D00",
  wordBreak: "break-all",
};

const divider = {
  borderColor: "#222",
  margin: "0",
};

const detailsSection = {
  padding: "32px 40px",
};

const detailsTitle = {
  color: "#FF4D00",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "3px",
  margin: "0 0 20px",
};

const detailRow = {
  marginBottom: "10px",
};

const detailLabel = {
  color: "#666",
  fontSize: "13px",
  fontWeight: "600",
  width: "120px",
};

const detailValue = {
  color: "#E0E0E0",
  fontSize: "13px",
};

const nextSection = {
  padding: "32px 40px",
};

const nextItem = {
  color: "#CCCCCC",
  fontSize: "14px",
  lineHeight: "1.7",
  margin: "0 0 8px",
};

const secondaryButton = {
  backgroundColor: "transparent",
  color: "#FF4D00",
  fontSize: "14px",
  fontWeight: "700",
  textDecoration: "none",
  padding: "12px 28px",
  borderRadius: "4px",
  border: "2px solid #FF4D00",
  display: "inline-block",
  marginTop: "16px",
};

const footerSection = {
  padding: "24px 40px 32px",
  textAlign: "center",
};

const footerText = {
  color: "#444",
  fontSize: "12px",
  margin: "0 0 6px",
};

const footerLink = {
  color: "#666",
  textDecoration: "underline",
};

const footerNote = {
  color: "#333",
  fontSize: "11px",
  marginTop: "12px",
};