import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Button,
} from "@react-email/components";
import * as React from "react";

/**
 * LoginNotification Component
 * @param {string} email     - The user's email address
 * @param {string} loginTime - Formatted timestamp of the login event
 */
export default function LoginNotification({
  email = "user@example.com",
  loginTime = "July 23, 2026 at 09:33 PM IST",
}) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>New login detected on your CodeBuddy account</Preview>
      <Body style={main}>
        {/* Header */}
        <Section style={header}>
          <Text style={logo}>⚡ CodeBuddy</Text>
        </Section>

        <Container style={container}>
          {/* Hero */}
          <Section style={heroBand}>
            <Text style={heroEyebrow}>SECURITY ALERT</Text>
            <Heading style={heroHeading}>New Login Detected</Heading>
            <Text style={heroSub}>
              Hi {email}, we noticed a new login to your CodeBuddy account.
            </Text>
          </Section>

          {/* Login Details Card */}
          <Section style={detailsSection}>
            <Text style={detailsTitle}>SESSION DETAILS</Text>

            <Row style={detailRow}>
              <Column style={detailLabel}>Account Email</Column>
              <Column style={detailValue}>{email}</Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>Time</Column>
              <Column style={detailValue}>{loginTime}</Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Security Action */}
          <Section style={actionSection}>
            <Text style={actionTitle}>WAS THIS YOU?</Text>
            <Text style={actionText}>
              If you just logged into your account, you can safely ignore this email.
            </Text>
            <Text style={actionWarningText}>
              If this wasn't you, someone else may have gained access to your account. Please secure your account immediately.
            </Text>
            <Button
              href="https://codebuddy.amitdhangar.in/"
              style={actionButton}
            >
              Secure My Account
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © {currentYear} CodeBuddy Inc. · All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="https://codebuddy.amitdhangar.in/privacy" style={footerLink}>
                Privacy Policy
              </Link>
              {" · "}
              <Link href="https://codebuddy.amitdhangar.in/terms" style={footerLink}>
                Terms
              </Link>
            </Text>
            <Text style={footerNote}>
              This is an automated security notification regarding your CodeBuddy account.
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
  margin: "0 auto",
  padding: "20px 0",
};

const header = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#0D0D0D",
  padding: "20px 40px",
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
  border: "1px solid #222222",
  borderRadius: "8px",
  overflow: "hidden",
};

const heroBand = {
  backgroundColor: "#FF4D00",
  padding: "40px",
};

const heroEyebrow = {
  color: "#141414",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "3px",
  textTransform: "uppercase",
  margin: "0 0 12px",
};

const heroHeading = {
  color: "#FFFFFF",
  fontSize: "32px",
  fontWeight: "900",
  lineHeight: "1.2",
  margin: "0 0 12px",
  letterSpacing: "-0.5px",
};

const heroSub = {
  color: "#FFFFFF",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0",
  opacity: 0.9,
};

const divider = {
  borderColor: "#222222",
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
  marginBottom: "12px",
};

const detailLabel = {
  color: "#888888",
  fontSize: "13px",
  fontWeight: "600",
  width: "140px",
};

const detailValue = {
  color: "#E0E0E0",
  fontSize: "13px",
  fontWeight: "500",
};

const actionSection = {
  padding: "32px 40px",
  backgroundColor: "#111111",
};

const actionTitle = {
  color: "#FFFFFF",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "3px",
  margin: "0 0 12px",
};

const actionText = {
  color: "#888888",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 12px",
};

const actionWarningText = {
  color: "#FF4D00",
  fontSize: "13px",
  lineHeight: "1.5",
  fontWeight: "500",
  margin: "0 0 20px",
};

const actionButton = {
  backgroundColor: "#FF4D00",
  borderRadius: "6px",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 24px",
};

const footerSection = {
  padding: "28px 40px",
  textAlign: "center",
  backgroundColor: "#0D0D0D",
};

const footerText = {
  color: "#666666",
  fontSize: "12px",
  margin: "0 0 6px",
};

const footerLink = {
  color: "#888888",
  textDecoration: "underline",
};

const footerNote = {
  color: "#444444",
  fontSize: "11px",
  marginTop: "12px",
  lineHeight: "1.5",
};