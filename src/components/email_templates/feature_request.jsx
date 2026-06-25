import {
  Body,
  Button,
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
} from "@react-email/components";
import * as React from "react";

/**
 * FeatureRequestEmail Props:
 * @param {string} userName          - Name of the user who submitted the request
 * @param {string} userEmail         - Email of the user
 * @param {string} requestTitle      - Title/name of the requested feature
 * @param {string} requestDescription - Detailed description of the feature request
 * @param {string} ticketId          - Unique ticket/reference ID for tracking
 * @param {string} ticketUrl         - URL to view the ticket/request status
 * @param {"submitted"|"under_review"|"planned"|"in_progress"} status - Current status of the request
 */
export default function FeatureRequestEmail({
  userName = "Jordan",
  userEmail = "jordan@example.com",
  requestTitle = "Dark Mode for Code Editor",
  requestDescription =
    "Add a toggleable dark mode theme to the in-browser code editor with custom syntax highlighting support.",
  ticketId = "FR-20481",
  ticketUrl = "https://codebuddy.dev/feature-requests/FR-20481",
  status = "submitted",
}) {
  const statusConfig = {
    submitted: { label: "Submitted", color: "#FF4D00", bg: "#2A1A0D" },
    under_review: { label: "Under Review", color: "#FFB800", bg: "#2A2300" },
    planned: { label: "Planned", color: "#00C896", bg: "#002A1E" },
    in_progress: { label: "In Progress", color: "#4D9FFF", bg: "#001A2A" },
  };

  const s = statusConfig[status] || statusConfig.submitted;

  return (
    <Html>
      <Head />
      <Preview>Feature request received: {requestTitle} — Ticket {ticketId}</Preview>
      <Body style={main}>
        <Section style={header}>
          <Text style={logo}>⚡ CodeBuddy</Text>
        </Section>

        <Container style={container}>
          {/* Hero */}
          <Section style={heroBand}>
            <Text style={heroEyebrow}>FEATURE REQUEST</Text>
            <Heading style={heroHeading}>We got your idea, {userName}.</Heading>
            <Text style={heroSub}>
              Our product team reviews every request. You'll hear from us when something changes.
            </Text>
          </Section>

          {/* Ticket Info */}
          <Section style={ticketSection}>
            <Row>
              <Column style={ticketIdCol}>
                <Text style={ticketIdLabel}>TICKET ID</Text>
                <Text style={ticketIdValue}>{ticketId}</Text>
              </Column>
              <Column style={statusCol}>
                <Text style={ticketIdLabel}>STATUS</Text>
                <Text style={{ ...statusBadge, color: s.color, backgroundColor: s.bg }}>
                  {s.label}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Request Details */}
          <Section style={requestSection}>
            <Text style={sectionLabel}>YOUR REQUEST</Text>
            <Text style={requestTitleStyle}>{requestTitle}</Text>
            <Text style={requestDesc}>{requestDescription}</Text>
          </Section>

          <Hr style={divider} />

          {/* What Happens Next */}
          <Section style={nextSection}>
            <Text style={sectionLabel}>WHAT HAPPENS NEXT?</Text>
            <Text style={nextStep}>
              <span style={stepNumber}>01</span>
              <span style={stepText}>Our team reviews your request within 3–5 business days.</span>
            </Text>
            <Text style={nextStep}>
              <span style={stepNumber}>02</span>
              <span style={stepText}>If it fits our roadmap, it gets marked as Planned.</span>
            </Text>
            <Text style={nextStep}>
              <span style={stepNumber}>03</span>
              <span style={stepText}>You'll get an email the moment status changes.</span>
            </Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={ticketUrl}>
              Track My Request →
            </Button>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>© 2024 CodeBuddy Inc. · All rights reserved.</Text>
            <Text style={footerText}>
              This was sent to {userEmail} because you submitted a feature request.
            </Text>
            <Text style={footerText}>
              <Link href="https://codebuddy.dev/settings/notifications" style={footerLink}>
                Manage Notifications
              </Link>
              {" · "}
              <Link href="https://codebuddy.dev/privacy" style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#0D0D0D", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" };
const header = { backgroundColor: "#0D0D0D", padding: "24px 40px", borderBottom: "2px solid #FF4D00" };
const logo = { color: "#FF4D00", fontSize: "22px", fontWeight: "900", letterSpacing: "-0.5px", margin: "0" };
const container = { maxWidth: "600px", margin: "0 auto", backgroundColor: "#141414", border: "1px solid #222" };
const heroBand = { backgroundColor: "#FF4D00", padding: "48px 40px" };
const heroEyebrow = { color: "#FFD6C4", fontSize: "11px", fontWeight: "800", letterSpacing: "3px", margin: "0 0 12px" };
const heroHeading = { color: "#FFFFFF", fontSize: "34px", fontWeight: "900", lineHeight: "1.1", margin: "0 0 12px", letterSpacing: "-1px" };
const heroSub = { color: "#FFD6C4", fontSize: "15px", lineHeight: "1.6", margin: "0" };
const ticketSection = { padding: "28px 40px", backgroundColor: "#1A1A1A" };
const ticketIdCol = { width: "50%", verticalAlign: "top" };
const statusCol = { width: "50%", verticalAlign: "top" };
const ticketIdLabel = { color: "#666", fontSize: "11px", fontWeight: "800", letterSpacing: "2px", margin: "0 0 6px" };
const ticketIdValue = { color: "#FF4D00", fontSize: "22px", fontWeight: "900", fontFamily: "monospace", margin: "0" };
const statusBadge = { fontSize: "13px", fontWeight: "700", padding: "6px 14px", borderRadius: "40px", display: "inline-block", margin: "0" };
const divider = { borderColor: "#222", margin: "0" };
const requestSection = { padding: "32px 40px" };
const sectionLabel = { color: "#FF4D00", fontSize: "11px", fontWeight: "800", letterSpacing: "3px", margin: "0 0 14px" };
const requestTitleStyle = { color: "#FFFFFF", fontSize: "20px", fontWeight: "800", margin: "0 0 12px" };
const requestDesc = { color: "#AAAAAA", fontSize: "14px", lineHeight: "1.7", margin: "0" };
const nextSection = { padding: "32px 40px" };
const nextStep = { display: "flex", alignItems: "flex-start", marginBottom: "14px", color: "#CCCCCC", fontSize: "14px", lineHeight: "1.6" };
const stepNumber = { color: "#FF4D00", fontWeight: "900", fontSize: "16px", minWidth: "36px", display: "inline-block" };
const stepText = { color: "#CCCCCC" };
const ctaSection = { padding: "8px 40px 36px", textAlign: "center" };
const ctaButton = { backgroundColor: "#FF4D00", color: "#FFFFFF", fontSize: "16px", fontWeight: "800", textDecoration: "none", padding: "16px 40px", borderRadius: "4px", display: "inline-block" };
const footerSection = { padding: "24px 40px 32px", textAlign: "center" };
const footerText = { color: "#444", fontSize: "12px", margin: "0 0 6px" };
const footerLink = { color: "#666", textDecoration: "underline" };