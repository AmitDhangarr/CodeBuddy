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
 * JobApplicationEmail Props:
 * @param {string} applicantName     - Full name of the applicant
 * @param {string} applicantEmail    - Email address of the applicant
 * @param {string} jobTitle          - Title of the job applied for
 * @param {string} companyName       - Name of the hiring company
 * @param {string} applicationId     - Unique application reference ID
 * @param {string} applicationDate   - Date the application was submitted (formatted string)
 * @param {string} statusUrl         - URL to check application status
 * @param {"received"|"reviewing"|"shortlisted"|"rejected"} status - Current application status
 */
export default function JobApplicationEmail({
  applicantName = "Morgan Chen",
  applicantEmail = "morgan@example.com",
  jobTitle = "Senior Frontend Engineer",
  companyName = "Figma",
  applicationId = "APP-78432",
  applicationDate = "June 25, 2024",
  statusUrl = "https://codebuddy.dev/jobs/applications/APP-78432",
  status = "received",
}) {
  const statusMap = {
    received: { label: "Application Received", color: "#FF4D00", bg: "#2A1A0D", icon: "📨" },
    reviewing: { label: "Under Review", color: "#FFB800", bg: "#2A2300", icon: "🔍" },
    shortlisted: { label: "Shortlisted!", color: "#00C896", bg: "#002A1E", icon: "⭐" },
    rejected: { label: "Not Moving Forward", color: "#FF4D6A", bg: "#2A0010", icon: "📋" },
  };

  const s = statusMap[status] || statusMap.received;

  return (
    <Html>
      <Head />
      <Preview>Application {applicationId} for {jobTitle} at {companyName} — {s.label}</Preview>
      <Body style={main}>
        <Section style={header}>
          <Text style={logo}>⚡ CodeBuddy</Text>
        </Section>

        <Container style={container}>
          {/* Hero */}
          <Section style={heroBand}>
            <Text style={heroEyebrow}>JOB APPLICATION</Text>
            <Heading style={heroHeading}>Application {s.icon}</Heading>
            <Text style={heroSub}>
              {status === "shortlisted"
                ? `Great news, ${applicantName}! You've been shortlisted for the ${jobTitle} role at ${companyName}.`
                : status === "rejected"
                ? `Hi ${applicantName}, thank you for your interest in the ${jobTitle} role at ${companyName}.`
                : `Your application for ${jobTitle} at ${companyName} has been received, ${applicantName}.`}
            </Text>
          </Section>

          {/* Application Details */}
          <Section style={detailsSection}>
            <Text style={sectionLabel}>APPLICATION DETAILS</Text>
            <Row style={detailRow}>
              <Column style={detailLabel}>Position</Column>
              <Column style={detailValue}>{jobTitle}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Company</Column>
              <Column style={detailValue}>{companyName}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Application ID</Column>
              <Column style={{ ...detailValue, fontFamily: "monospace", color: "#FF4D00" }}>
                {applicationId}
              </Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Date Submitted</Column>
              <Column style={detailValue}>{applicationDate}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Status</Column>
              <Column style={detailValue}>
                <Text style={{ ...statusBadge, color: s.color, backgroundColor: s.bg }}>
                  {s.label}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Status Message */}
          {status === "shortlisted" && (
            <Section style={alertSection}>
              <Text style={alertText}>
                🎉 The hiring team will reach out within 2–3 business days to schedule next steps.
                Keep an eye on your inbox!
              </Text>
            </Section>
          )}

          {status === "received" && (
            <Section style={nextSection}>
              <Text style={sectionLabel}>WHAT HAPPENS NEXT?</Text>
              <Text style={nextStep}><span style={stepNum}>01</span> Our team reviews your profile & portfolio.</Text>
              <Text style={nextStep}><span style={stepNum}>02</span> Shortlisted candidates are contacted within 5–7 days.</Text>
              <Text style={nextStep}><span style={stepNum}>03</span> You'll receive an update regardless of the outcome.</Text>
            </Section>
          )}

          {status === "rejected" && (
            <Section style={nextSection}>
              <Text style={sectionLabel}>A NOTE FROM THE TEAM</Text>
              <Text style={rejectedNote}>
                After careful review, we've decided to move forward with other candidates at this
                time. This doesn't reflect your skills — competition was exceptionally high. We
                encourage you to apply for future roles that match your background.
              </Text>
            </Section>
          )}

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={statusUrl}>
              Track My Application →
            </Button>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>© 2024 CodeBuddy Inc. · All rights reserved.</Text>
            <Text style={footerText}>Sent to {applicantEmail}</Text>
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
const heroHeading = { color: "#FFFFFF", fontSize: "36px", fontWeight: "900", lineHeight: "1.1", margin: "0 0 12px", letterSpacing: "-1px" };
const heroSub = { color: "#FFD6C4", fontSize: "15px", lineHeight: "1.6", margin: "0" };
const detailsSection = { padding: "32px 40px" };
const sectionLabel = { color: "#FF4D00", fontSize: "11px", fontWeight: "800", letterSpacing: "3px", margin: "0 0 16px" };
const detailRow = { marginBottom: "12px" };
const detailLabel = { color: "#666", fontSize: "13px", fontWeight: "600", width: "140px" };
const detailValue = { color: "#E0E0E0", fontSize: "13px" };
const statusBadge = { fontSize: "12px", fontWeight: "700", padding: "5px 12px", borderRadius: "40px", display: "inline-block", margin: "0" };
const divider = { borderColor: "#222", margin: "0" };
const alertSection = { backgroundColor: "#002A1E", padding: "20px 40px" };
const alertText = { color: "#00C896", fontSize: "14px", lineHeight: "1.6", margin: "0", fontWeight: "600" };
const nextSection = { padding: "28px 40px" };
const nextStep = { color: "#CCCCCC", fontSize: "14px", lineHeight: "1.6", marginBottom: "10px" };
const stepNum = { color: "#FF4D00", fontWeight: "900", marginRight: "12px" };
const rejectedNote = { color: "#AAAAAA", fontSize: "14px", lineHeight: "1.7", margin: "0" };
const ctaSection = { padding: "8px 40px 36px", textAlign: "center" };
const ctaButton = { backgroundColor: "#FF4D00", color: "#FFFFFF", fontSize: "16px", fontWeight: "800", textDecoration: "none", padding: "16px 40px", borderRadius: "4px", display: "inline-block" };
const footerSection = { padding: "24px 40px 32px", textAlign: "center" };
const footerText = { color: "#444", fontSize: "12px", margin: "0 0 6px" };
const footerLink = { color: "#666", textDecoration: "underline" };