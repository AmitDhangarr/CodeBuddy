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
 * ConnectionRequestEmail Props:
 * @param {string} recipientName     - Name of the person receiving the request
 * @param {string} senderName        - Name of the person sending the connection request
 * @param {string} senderRole        - Job title / role of the sender (e.g. "Senior Engineer at Stripe")
 * @param {string} senderBio         - Short bio / message from the sender
 * @param {string} senderAvatarUrl   - URL to sender's profile picture
 * @param {string} acceptUrl         - Link to accept the connection
 * @param {string} declineUrl        - Link to decline the connection
 * @param {string} senderProfileUrl  - Link to sender's public profile
 */
export default function ConnectionRequestEmail({
  recipientName = "Alex",
  senderName = "Jamie Lee",
  senderRole = "Full-Stack Engineer at Vercel",
  senderBio = "Hey! I came across your open-source work on GitHub and I'd love to connect. Always great to meet fellow devs pushing boundaries.",
  senderAvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie",
  acceptUrl = "https://codebuddy.dev/connections/accept?token=abc123",
  declineUrl = "https://codebuddy.dev/connections/decline?token=abc123",
  senderProfileUrl = "https://codebuddy.dev/profile/jamie-lee",
}) {
  return (
    <Html>
      <Head />
      <Preview>{senderName} wants to connect with you on CodeBuddy</Preview>
      <Body style={main}>
        {/* Header */}
        <Section style={header}>
          <Text style={logo}>⚡ CodeBuddy</Text>
        </Section>

        <Container style={container}>
          {/* Hero Band */}
          <Section style={heroBand}>
            <Text style={heroEyebrow}>NEW CONNECTION REQUEST</Text>
            <Heading style={heroHeading}>Someone wants in your network.</Heading>
          </Section>

          {/* Sender Card */}
          <Section style={senderCard}>
            <Row>
              <Column style={avatarCol}>
                <img src={senderAvatarUrl} alt={senderName} style={avatar} />
              </Column>
              <Column style={senderInfo}>
                <Text style={senderNameStyle}>{senderName}</Text>
                <Text style={senderRoleStyle}>{senderRole}</Text>
                <Link href={senderProfileUrl} style={profileLink}>
                  View Profile →
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Message */}
          <Section style={messageSection}>
            <Text style={messageLabel}>THEIR MESSAGE</Text>
            <Text style={messageText}>"{senderBio}"</Text>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaHeading}>Do you want to connect with {senderName}?</Text>
            <Row>
              <Column style={btnCol}>
                <Button style={acceptButton} href={acceptUrl}>
                  ✅ Accept
                </Button>
              </Column>
              <Column style={btnCol}>
                <Button style={declineButton} href={declineUrl}>
                  ✖ Decline
                </Button>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>© 2024 CodeBuddy Inc. · All rights reserved.</Text>
            <Text style={footerText}>
              <Link href="https://codebuddy.dev/settings/notifications" style={footerLink}>
                Manage Notifications
              </Link>
              {" · "}
              <Link href="https://codebuddy.dev/privacy" style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
            <Text style={footerNote}>
              You received this because someone searched for and found your CodeBuddy profile.
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
const heroHeading = { color: "#FFFFFF", fontSize: "34px", fontWeight: "900", lineHeight: "1.1", margin: "0", letterSpacing: "-1px" };
const senderCard = { padding: "32px 40px", backgroundColor: "#1A1A1A" };
const avatarCol = { width: "72px", verticalAlign: "middle" };
const avatar = { width: "64px", height: "64px", borderRadius: "50%", border: "3px solid #FF4D00" };
const senderInfo = { paddingLeft: "16px", verticalAlign: "middle" };
const senderNameStyle = { color: "#FFFFFF", fontSize: "20px", fontWeight: "800", margin: "0 0 4px" };
const senderRoleStyle = { color: "#888", fontSize: "13px", margin: "0 0 8px" };
const profileLink = { color: "#FF4D00", fontSize: "13px", fontWeight: "700", textDecoration: "none" };
const messageSection = { padding: "28px 40px" };
const messageLabel = { color: "#FF4D00", fontSize: "11px", fontWeight: "800", letterSpacing: "3px", margin: "0 0 12px" };
const messageText = { color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7", fontStyle: "italic", borderLeft: "3px solid #FF4D00", paddingLeft: "16px", margin: "0" };
const divider = { borderColor: "#222", margin: "0" };
const ctaSection = { padding: "36px 40px", textAlign: "center" };
const ctaHeading = { color: "#E0E0E0", fontSize: "16px", fontWeight: "700", marginBottom: "24px" };
const btnCol = { width: "50%", textAlign: "center" };
const acceptButton = { backgroundColor: "#FF4D00", color: "#FFFFFF", fontSize: "15px", fontWeight: "800", textDecoration: "none", padding: "14px 32px", borderRadius: "4px", display: "inline-block" };
const declineButton = { backgroundColor: "transparent", color: "#666", fontSize: "15px", fontWeight: "700", textDecoration: "none", padding: "14px 32px", borderRadius: "4px", border: "2px solid #333", display: "inline-block" };
const footerSection = { padding: "24px 40px 32px", textAlign: "center" };
const footerText = { color: "#444", fontSize: "12px", margin: "0 0 6px" };
const footerLink = { color: "#666", textDecoration: "underline" };
const footerNote = { color: "#333", fontSize: "11px", marginTop: "12px" };