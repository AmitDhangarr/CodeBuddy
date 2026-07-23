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
 * PlanPurchasedNotification Component
 * @param {string} username      - The user's display name
 * @param {string} planName      - Name of the purchased plan
 * @param {string} billingCycle  - Billing frequency
 * @param {string} amount        - Formatted cost
 * @param {string} paymentMethod - Payment type or card snippet
 * @param {string} transactionId - Unique reference/invoice ID
 * @param {string} date          - Date of purchase
 */
export default function PlanPurchasedNotification({
  username = "Developer",
  planName = "Pro Plan",
  billingCycle = "Monthly",
  amount = "$29.00 / month",
  paymentMethod = "Visa ending in 4242",
  transactionId = "INV-2026-8841",
  date = "July 23, 2026",
}) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Receipt for your {planName} subscription</Preview>
      <Body style={main}>
        {/* Header */}
        <Section style={header}>
          <Text style={logo}>⚡ CodeBuddy</Text>
        </Section>

        <Container style={container}>
          {/* Hero */}
          <Section style={heroBand}>
            <Text style={heroEyebrow}>SUBSCRIPTION CONFIRMED</Text>
            <Heading style={heroHeading}>You're upgraded, {username}!</Heading>
            <Text style={heroSub}>
              Thank you for subscribing to CodeBuddy. Your account has been upgraded and all premium features are now unlocked.
            </Text>
          </Section>

          {/* Plan & Payment Details Card */}
          <Section style={detailsSection}>
            <Text style={detailsTitle}>PURCHASE SUMMARY</Text>

            <Row style={detailRow}>
              <Column style={detailLabel}>Plan</Column>
              <Column style={detailValueHighlight}>{planName}</Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>Billing Cycle</Column>
              <Column style={detailValue}>{billingCycle}</Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>Amount Paid</Column>
              <Column style={detailValue}>{amount}</Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>Payment Method</Column>
              <Column style={detailValue}>{paymentMethod}</Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>Date</Column>
              <Column style={detailValue}>{date}</Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>Transaction ID</Column>
              <Column style={detailValueCode}>{transactionId}</Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Action / Next Steps Section */}
          <Section style={actionSection}>
            <Text style={actionTitle}>GET STARTED</Text>
            <Text style={actionText}>
              Ready to dive in? Head over to your dashboard to start exploring your new features and perks.
            </Text>
            <Button
              href="https://codebuddy.dev/dashboard"
              style={actionButton}
            >
              Go to Dashboard
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © {currentYear} CodeBuddy Inc. · All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="https://codebuddy.dev/account/billing" style={footerLink}>
                Manage Subscription
              </Link>
              {" · "}
              <Link href="https://codebuddy.dev/terms" style={footerLink}>
                Terms
              </Link>
            </Text>
            <Text style={footerNote}>
              This email serves as an official receipt for your subscription purchase. You can download invoice PDFs anytime from your billing settings.
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

const detailValueHighlight = {
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "700",
};

const detailValueCode = {
  color: "#888888",
  fontSize: "13px",
  fontFamily: "monospace",
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