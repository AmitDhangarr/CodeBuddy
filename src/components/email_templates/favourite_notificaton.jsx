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
 * FavoritesListNotification Component
 * @param {string} username         - The user's display name
 * @param {Array} items            - Array of favorited items to showcase
 * @param {number} totalFavorites   - Total count of favorited items in their account
 */
export default function FavoritesListNotification({
  username = "Developer",
  totalFavorites = 12,
  items = [
    {
      id: "1",
      title: "React Email Components Masterclass",
      category: "Tutorial",
      updatedAt: "Updated 2 days ago",
      url: "https://codebuddy.dev/tutorials/react-email",
    },
    {
      id: "2",
      title: "Next.js Authentication Boilerplate",
      category: "Repository",
      updatedAt: "Updated 1 week ago",
      url: "https://codebuddy.dev/repos/nextjs-auth",
    },
    {
      id: "3",
      title: "Custom CSS Grid Cheatsheet",
      category: "Snippet",
      updatedAt: "Updated 3 weeks ago",
      url: "https://codebuddy.dev/snippets/css-grid",
    },
  ],
}) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Your saved favorites on CodeBuddy ({totalFavorites} items)</Preview>
      <Body style={main}>
        {/* Header */}
        <Section style={header}>
          <Text style={logo}>⚡ CodeBuddy</Text>
        </Section>

        <Container style={container}>
          {/* Hero */}
          <Section style={heroBand}>
            <Text style={heroEyebrow}>YOUR BOOKMARKS</Text>
            <Heading style={heroHeading}>Your Favorite Items</Heading>
            <Text style={heroSub}>
              Hi {username}, here is a quick look at your saved favorites and recent updates on CodeBuddy.
            </Text>
          </Section>

          {/* Favorites List Card */}
          <Section style={detailsSection}>
            <Row style={sectionHeaderRow}>
              <Column>
                <Text style={detailsTitle}>FAVORITES SUMMARY</Text>
              </Column>
              <Column style={counterColumn}>
                <Text style={counterBadge}>{totalFavorites} Saved</Text>
              </Column>
            </Row>

            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                <Row style={itemRow}>
                  <Column>
                    <Text style={itemCategory}>{item.category.toUpperCase()}</Text>
                    <Text style={itemTitle}>{item.title}</Text>
                    {item.updatedAt && (
                      <Text style={itemMeta}>{item.updatedAt}</Text>
                    )}
                  </Column>
                  <Column style={actionColumn}>
                    <Link href={item.url} style={viewLink}>
                      View →
                    </Link>
                  </Column>
                </Row>
                {index < items.length - 1 && <Hr style={itemDivider} />}
              </React.Fragment>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Action / CTA Section */}
          <Section style={actionSection}>
            <Text style={actionTitle}>EXPLORE MORE</Text>
            <Text style={actionText}>
              Want to organize your collections or view all {totalFavorites} items in your list?
            </Text>
            <Button
              href="https://codebuddy.dev/account/favorites"
              style={actionButton}
            >
              View All Favorites
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © {currentYear} CodeBuddy Inc. · All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="https://codebuddy.dev/account/favorites" style={footerLink}>
                Manage Favorites
              </Link>
              {" · "}
              <Link href="https://codebuddy.dev/terms" style={footerLink}>
                Terms
              </Link>
            </Text>
            <Text style={footerNote}>
              You are receiving this digest because you saved items to your favorites list on CodeBuddy.
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

const sectionHeaderRow = {
  marginBottom: "20px",
};

const detailsTitle = {
  color: "#FF4D00",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "3px",
  margin: "0",
};

const counterColumn = {
  textAlign: "right",
};

const counterBadge = {
  color: "#888888",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0",
};

const itemRow = {
  padding: "12px 0",
};

const itemCategory = {
  color: "#FF4D00",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "1.5px",
  margin: "0 0 4px",
};

const itemTitle = {
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const itemMeta = {
  color: "#666666",
  fontSize: "12px",
  margin: "0",
};

const actionColumn = {
  textAlign: "right",
  verticalAlign: "middle",
  width: "80px",
};

const viewLink = {
  color: "#FF4D00",
  fontSize: "13px",
  fontWeight: "700",
  textDecoration: "none",
};

const itemDivider = {
  borderColor: "#222222",
  margin: "8px 0",
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